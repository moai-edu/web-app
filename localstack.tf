variable "bucket_name" {
  description = "The base name of the S3 bucket"
  type        = string
  default     = ""
}

variable "table_name" {
  description = "The base name of the DynamoDB table"
  type        = string
  default     = ""
}

# 定义环境类型
locals {
  environments = {
    local = ""
    test = "-test"
  }
}

# 动态创建S3 bucket
resource "aws_s3_bucket" "PortalSiteDataBucket" {
  for_each = local.environments
  bucket   = "${var.bucket_name}${each.value}"
}

# 动态创建DynamoDB表
resource "aws_dynamodb_table" "PortalSiteDb" {
  for_each     = local.environments
  name         = "${var.table_name}${each.value}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  dynamic "attribute" {
    for_each = [
      { name = "pk", type = "S" },
      { name = "sk", type = "S" },
      { name = "GSI1PK", type = "S" },
      { name = "GSI1SK", type = "S" },
      { name = "GSI2PK", type = "S" },
      { name = "GSI2SK", type = "S" }
    ]
    content {
      name = attribute.value.name
      type = attribute.value.type
    }
  }

  dynamic "global_secondary_index" {
    for_each = [
      { name = "GSI1", hash_key = "GSI1PK", range_key = "GSI1SK" },
      { name = "GSI2", hash_key = "GSI2PK", range_key = "GSI2SK" }
    ]
    content {
      name            = global_secondary_index.value.name
      hash_key        = global_secondary_index.value.hash_key
      range_key       = global_secondary_index.value.range_key
      projection_type = "ALL"
    }
  }

  ttl {
    attribute_name = "expires"
    enabled        = true
  }
}