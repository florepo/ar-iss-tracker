# HTTP API Gateway
resource "aws_apigatewayv2_api" "api" {
  name          = "cors-proxy-api"
  protocol_type = "HTTP"

  depends_on    = [
    aws_lambda_function.lambda
  ]
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id               = aws_apigatewayv2_api.api.id
  integration_type     = "AWS_PROXY"

  integration_method   = "POST"
  integration_uri      = aws_lambda_function.lambda.invoke_arn
  passthrough_behavior = "WHEN_NO_MATCH"
}

resource "aws_apigatewayv2_route" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  route_key   = "$default"
  target      = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "production" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "prod"
  auto_deploy = true
}

resource "aws_apigatewayv2_deployment" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  description = "API deployment"

  triggers = {
    redeployment = sha1(join(",", list(
      jsonencode(aws_apigatewayv2_integration.lambda),
      jsonencode(aws_apigatewayv2_route.default),
    )))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Permissions
data "aws_caller_identity" "current" { }

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "allow_apigw_invoke"
	function_name = aws_lambda_function.lambda.function_name
  action        = "lambda:InvokeFunction"
	principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_stage.production.execution_arn}/${aws_apigatewayv2_route.default.route_key}"
}

# Custom Endpoint
resource "aws_apigatewayv2_domain_name" "gateway_domain" {
  domain_name = "${var.api_subdomain_name}.${var.root_domain_name}"

  domain_name_configuration {
    certificate_arn = aws_acm_certificate.api_regional.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  depends_on = [aws_acm_certificate_validation.api_regional_cert_validation]
}

resource "aws_route53_record" "api_domain" {
  zone_id = data.aws_route53_zone.root_domain.zone_id
  name    = aws_apigatewayv2_domain_name.gateway_domain.domain_name
  type    = "CNAME"

  alias {
    name                   = aws_apigatewayv2_domain_name.gateway_domain.domain_name_configuration.0.target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.gateway_domain.domain_name_configuration.0.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_apigatewayv2_api_mapping" "custom_domain" {
  domain_name = aws_apigatewayv2_domain_name.gateway_domain.id
  api_id      = aws_apigatewayv2_api.api.id
  stage       = aws_apigatewayv2_stage.production.id
}
