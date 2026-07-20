from django.test import TestCase
from core.exceptions import MissingTenantContextError
from core.middleware import set_current_school, reset_current_school
from users.models import School, User
from social.models import Post

class TenantIsolationTests(TestCase):
    def setUp(self):
        # Create two separate schools
        self.school_a = School.objects.create(name="School A")
        self.school_b = School.objects.create(name="School B")
        
        self.user_a = User.objects.create(username="user_a", school=self.school_a)
        self.user_b = User.objects.create(username="user_b", school=self.school_b)

        # Create objects within their respective tenant contexts
        token_a = set_current_school(self.school_a.id)
        self.post_a = Post.objects.create(user=self.user_a, content="School A Post", school=self.school_a)
        reset_current_school(token_a)
        
        token_b = set_current_school(self.school_b.id)
        self.post_b = Post.objects.create(user=self.user_b, content="School B Post", school=self.school_b)
        reset_current_school(token_b)

    def test_missing_context_raises_error(self):
        """Ensure queries without context fail loudly instead of leaking data."""
        with self.assertRaises(MissingTenantContextError):
            list(Post.objects.all())

    def test_tenant_isolation(self):
        """Ensure a user in School A absolutely cannot see School B's objects."""
        token = set_current_school(self.school_a.id)
        
        posts = Post.objects.all()
        self.assertEqual(posts.count(), 1)
        self.assertEqual(posts.first().id, self.post_a.id)
        
        # Test cross-tenant direct fetch.
        # This proves that `get_object_or_404` in DRF will correctly throw a 404
        # instead of a 403, as the scoped manager hides the object entirely.
        with self.assertRaises(Post.DoesNotExist):
            Post.objects.get(id=self.post_b.id)
            
        reset_current_school(token)

    def test_break_glass_method(self):
        """Ensure platform admins can explicitly bypass the tenant scope using .all_schools()."""
        posts = Post.objects.all_schools()
        self.assertEqual(posts.count(), 2)
