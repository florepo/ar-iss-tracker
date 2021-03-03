# Data source containing the lambda function and for putting its zipped version
data "archive_file" "lambda_zip" {
  type = "zip"
  source_file = "../modules/static-website/lambda/index.js"
  output_path = "../modules/static-website/lambda/index.zip"
}

# Lambda Function
resource "aws_lambda_function" "lambda" {
  function_name     = "tle-proxy-js"

  filename          = data.archive_file.lambda_zip.output_path
  source_code_hash  = filebase64sha256(data.archive_file.lambda_zip.output_path)
  role              = aws_iam_role.lambda_execution_role.arn

  handler = "index.handler"
  runtime = "nodejs12.x"

  publish = true
}

# IAM role for Lambda Function
resource "aws_iam_role" "lambda_execution_role" {
  description        = "Execution role for Lambda functions"
  name               = "iam-lambda-role"

  assume_role_policy = <<EOF
{
        "Version"  : "2012-10-17",
        "Statement": [
            {
                "Action"   : "sts:AssumeRole",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Effect": "Allow",
                "Sid"   : ""
            }
        ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution_policy" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_gateway_invoke_policy" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonAPIGatewayInvokeFullAccess"
}
