import os
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config

def clear_dynamodb_table(table_name, pk_attr="pk", sk_attr="sk"):
    if os.environ.get('LOCAL'):
        dynamodb = boto3.client(
            'dynamodb',
            endpoint_url='http://localhost:4566',  # LocalStack 默认端口
            region_name='us-east-1',               # 任意 region（LocalStack 不校验）
            aws_access_key_id='test',              # LocalStack 固定值
            aws_secret_access_key='test',          # LocalStack 固定值
            config=Config(                         # 可选：超时设置
                connect_timeout=3,
                read_timeout=3
            )
        )
    else:
        dynamodb = boto3.client('dynamodb')

    try:
        # 1. 扫描所有记录的主键（仅需 pk 和 sk）
        print(f"Scanning table {table_name}...")
        response = dynamodb.scan(
            TableName=table_name,
            ProjectionExpression=f"{pk_attr}, {sk_attr}",
            Select="SPECIFIC_ATTRIBUTES"
        )
        items = response['Items']
        
        # 处理分页（可能超过 1MB 限制）
        while 'LastEvaluatedKey' in response:
            response = dynamodb.scan(
                TableName=table_name,
                ProjectionExpression=f"{pk_attr}, {sk_attr}",
                Select="SPECIFIC_ATTRIBUTES",
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            items.extend(response['Items'])
        
        # 2. 分批删除（每批最多 25 条）
        print(f"Found {len(items)} items to delete. Starting batch deletion...")
        for i in range(0, len(items), 25):
            batch = items[i:i+25]
            delete_requests = [
                {
                    'DeleteRequest': {
                        'Key': {
                            pk_attr: item[pk_attr],
                            sk_attr: item[sk_attr]
                        }
                    }
                } for item in batch
            ]
            
            dynamodb.batch_write_item(
                RequestItems={table_name: delete_requests}
            )
            print(f"Deleted batch {i//25 + 1} (items {i} to {i+len(batch)-1})")
        
        print("✅ All items deleted successfully!")
    
    except ClientError as e:
        print(f"❌ Error: {e.response['Error']['Message']}")

if __name__ == "__main__":
    clear_dynamodb_table(table_name=os.environ['TABLE_NAME'])