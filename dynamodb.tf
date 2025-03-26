resource "aws_dynamodb_table" "PortalSiteDb" {
  name         = "portal-site-db"
  billing_mode = "PAY_PER_REQUEST" # Alternatively, ON_DEMAND, see https://aws.amazon.com/dynamodb/pricing/
  hash_key     = "pk"
  range_key    = "sk"
 
  attribute {
    name = "pk"
    type = "S"
  }
 
  attribute {
    name = "sk"
    type = "S"
  }
 
  attribute {
    name = "GSI1PK"
    type = "S"
  }
 
  attribute {
    name = "GSI1SK"
    type = "S"
  }

  attribute {
    name = "GSI2PK"
    type = "S"
  }
 
  attribute {
    name = "GSI2SK"
    type = "S"
  }
 
  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "GSI2"
    hash_key        = "GSI2PK"
    range_key       = "GSI2SK"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expires"
    enabled        = true
  }
}