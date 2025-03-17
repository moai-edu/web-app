resource "aws_dynamodb_table" "authjs" {
  name         = "next-auth"
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
 
  global_secondary_index {
    hash_key        = "GSI1PK"
    name            = "GSI1"
    projection_type = "ALL"
    range_key       = "GSI1SK"
  }
 
  ttl {
    attribute_name = "expires"
    enabled        = true
  }
}