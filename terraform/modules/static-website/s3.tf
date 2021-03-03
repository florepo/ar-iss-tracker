# AWS main domain bucket (file storage)
resource "aws_s3_bucket" "website_root" {
  bucket = "${var.root_domain_name}"
  acl    = "public-read"
  policy = <<POLICY
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Sid":"AddPerm",
      "Effect":"Allow",
      "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::${var.root_domain_name}/*"]
    }
  ]
}
  POLICY

  website {
    index_document = "index.html"
    error_document = "index.html"
  }
}

resource "aws_s3_bucket" "website_redirect" {
  bucket        = "www.${var.root_domain_name}-redirect"
  acl           = "public-read"
  force_destroy = true

  website {
    redirect_all_requests_to = "https://www.${var.root_domain_name}"
  }

}
