provider "aws" {
  alias   = "acm_certificates_provider"
  region  = "us-east-1" # To use an ACM Certificate with CloudFront, we must request the certificate from the US East (N. Virginia) region.
  version = "3.27"
}

data "aws_route53_zone" "root_domain" {
  name         = var.root_domain_name
  private_zone = false
}

# ACM public Certificate, validate via DNS
resource "aws_acm_certificate" "website_domain" {
  provider          = aws.acm_certificates_provider

  domain_name               = var.root_domain_name
  subject_alternative_names = ["www.${var.root_domain_name}"]
  validation_method         = "DNS"
  
  lifecycle {
    create_before_destroy = true
  }
}

# Setup record for DNS validation of wildcard certificate
resource "aws_route53_record" "website_domain_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.website_domain.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.root_domain.zone_id
}

resource "aws_acm_certificate_validation" "website_domain_cert_validation" {
  provider                = aws.acm_certificates_provider

  certificate_arn         = aws_acm_certificate.website_domain.arn
  validation_record_fqdns = [for record in aws_route53_record.website_domain_cert_validation : record.fqdn]
}

# Regional certificate for HTTP API Gateway, validate via DNS
resource "aws_acm_certificate" "api_regional" {
  provider          = aws

  domain_name       = "${var.api_subdomain_name}.${var.root_domain_name}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Setup record for DNS validation of regional certificate
resource "aws_route53_record" "api_regional_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api_regional.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.root_domain.zone_id
}

# Certificate validation request
resource "aws_acm_certificate_validation" "api_regional_cert_validation" {
  certificate_arn         = aws_acm_certificate.api_regional.arn
  validation_record_fqdns = [for record in aws_route53_record.api_regional_cert_validation : record.fqdn]
}
