# Generated manually for teacher file uploads

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('academics', '0003_grade_approved_at_grade_approved_by_grade_status_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='assignment',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to='assignments/'),
        ),
        migrations.AddField(
            model_name='classmaterial',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to='class_materials/'),
        ),
    ]
