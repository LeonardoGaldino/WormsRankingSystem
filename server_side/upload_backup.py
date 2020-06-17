from datetime import datetime

from google.oauth2 import service_account
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive']
SERVICE_ACCOUNT_FILE = './wormsrankingsystem-034d01ddd906.json'
parents_ids = ['1Q9jfdzJfT9SVz7luRurjpevzQrZlG0YB']

def upload_backup():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)

    if not credentials.valid:
        credentials.refresh(Request())

    service = build('drive', 'v3', credentials=credentials)

    today = datetime.now()
    file_name = 'db_backup-{}/{}/{}'.format(today.day, today.month, today.year)
    file_metadata = {'name': file_name, 'parents': parents_ids}
    media = MediaFileUpload('db/db_dump', mimetype='text/plain')
    file = service.files().create(body=file_metadata,
                                        media_body=media,
                                        fields='id').execute()

if __name__ == '__main__':
    upload_backup()
