import boto3
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import uuid

class PresignedURLView(APIView):
    """
    Issues a pre-signed Cloudflare R2 URL for direct client-side uploads.
    This prevents file bytes from proxying through the Django API servers.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        filename = request.data.get('filename')
        file_type = request.data.get('file_type')
        
        if not filename or not file_type:
            return Response({"error": "filename and file_type required"}, status=400)
            
        # Secure filename generation to prevent path traversal & collisions
        ext = filename.split('.')[-1] if '.' in filename else ''
        secure_filename = f"{uuid.uuid4().hex}.{ext}"
        
        # Guard against unconfigured R2 variables during early development
        if not all([settings.CLOUDFLARE_ACCOUNT_ID, settings.R2_ACCESS_KEY_ID, settings.R2_SECRET_ACCESS_KEY]):
            return Response({"error": "Cloudflare R2 is not fully configured on the server."}, status=500)
            
        s3_client = boto3.client(
            's3',
            endpoint_url=f"https://{settings.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name='auto'
        )
        
        try:
            presigned_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': settings.R2_BUCKET_NAME,
                    'Key': secure_filename,
                    'ContentType': file_type
                },
                ExpiresIn=3600
            )
            return Response({
                'url': presigned_url,
                'key': secure_filename,
                'full_url': f"https://pub-{settings.CLOUDFLARE_ACCOUNT_ID}.r2.dev/{secure_filename}" # Example public URL mapping
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)
