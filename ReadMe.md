<!-- ABOUT THE PROJECT -->
## About the Project

View the current positon of the International Space Station through a 3D augmented reality model.

The positon is calculated based on up-to-date orbital data.


![AR ISS position model](https://github.com/flow1981/ar-iss-tracker/blob/main/app/assets/images/ar-model-computer.png?raw=true)

![AR ISS position model](https://github.com/flow1981/ar-iss-tracker/blob/main/app/assets/images/ar-model-mobile.png?raw=true)

<!-- USAGE EXAMPLES -->
## Usage

The model can be viewed by scanning the trigger image with the websites AR viewer.

#### Open the AR viewer

<img align=left src="https://github.com/flow1981/ar-iss-tracker/blob/main/app/assets/images/step-1.png?raw=true)" width="120" height="120">

When opening the AR viewer you will need to grant the page permission to access your camera.

Content Cell  | Scan the QR code with your mobile phone camera - either from a print-out, or directly from this website - to open the AR viewer.


#### Scan the Trigger Image
<img align="left" src="https://github.com/flow1981/ar-iss-tracker/blob/main/app/assets/images/step-2.png?raw=true)" width="120" height="120">

Once the AR viewer is open scan the trigger image with your mobile phone camera.

<br/>
<br/>
<br/>

#### Enjoy the view

<img align="left" src="https://github.com/flow1981/ar-iss-tracker/blob/main/app/assets/images/step-3.png?raw=true)" width="120" height="120">

An 3D model of the earth with appear above the trigger images, showing the live position of the International Space Station.

The augmented reality model is visible as long the trigger image is in the view of the mobile's camera.

<br/>

## Key Features

* Use of Augemented Reality, Natural Feature tracking and 3D modelling javascript libraries to create the visualization.
* Real-time position of ISS calculated with satellite.js based on up-to-date TLE (ThreeLineElement) orbital position data from Celestrack.
* Serverless architecture using AWS S3, Cloudfront, API gateway, and Lambda.
* Use of AWS HTTP API gateway & AWS Lambda as an alternative to 'cors-anywhere' for frontend cross origin data access.
* Supercheap webhosting due to S3, HTTP API Gateway, Cloudfront and Lambdas pricing structure.
* Https web hosting using AWS Cloudfront, and automated DNS based certificate validation.
* All required infrastructure for the project are defined and can be provisioned with Terraform.
* CI pipeline allows deployments on push to 'main' branch using Github workflows.
</div>

### Built With

* ES6
* [JSartoolkit5 with NFT (natural feature tracking)](https://github.com/artoolkitx/jsartoolkit5)
* [Three.js](https://threejs.org/)
* [satellite.js](https://github.com/shashwatak/satellite-js)
* [Bootstrap](https://getbootstrap.com/)
* [AWS - S3, Cloudfront, ACM, Route53, API Gateway, Lambda](https://aws.amazon.com/)
* Terraform
* [Github Workflows CI](https://github.com/features/actions)

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.
   ```sh
   git clone https://github.com/github_username/repo_name.git
   ```

### Prerequisites

This is a list of things you need to setup the project.
* [Install](https://learn.hashicorp.com/tutorials/terraform/install-cli) the Terraform CLI

* AWS account and AWS CLI

  - If you don't have an account yet signup for an [free tier AWS account](https://aws.amazon.com/free/) to host the project
  - [Install](https://aws.amazon.com/cli/) and setup the AWS CLI
  - Setup a [Terraform programmatic access user](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys) in AWS with the sufficient priviledges to create all resources of the project.
  - Store AWS access credentials for Terraform accces in a [local AWS credentials file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html). Never store them directly in your codebase!

* Your domain name
  - You will require your own to domain for deploying to AWS.
  - The domain will be needed for TLS certificate validation to enable hosting the website via https:// (which is required for the AR viewer to work, and best practice anyway).
  - Additionally, a subdomain is needed as an endpoint for the HTTP API gateway (used for 'frontend' cross origin access of the orbital position data).
  - AWS offers to buy a domain with its Route53 service, alternatively you can import your domain from an external source as well (see AWS docs).

### Installation

#### Provision the infrastructure on AWS

First cd into folder /terraform/remote-state-init/ and rename the aws_s3_bucket in the remote-state-s3.tf file to a new unique name (bucket names have to be globally unique).
Import or buy your domain with Route53 and setup a hosted zone with your domain name record.
Adjust root_domain_name and api_sub_domain name in /terraform/enviroment/main.tf to your names.

##### Setup the Terraform remote backend

Run the following command in the same folder to setup the remote state file storage.

  ```
terraform plan
terraform apply
  ```

##### Provision the required AWS resources with terraform

Run the following commands from the /terraform/enviroment folder to setup the resources

 ```
terraform plan
terraform apply
  ```

##### Configure Github Actions

The project uses [Github Actions](https://docs.github.com/en/actions/learn-github-actions) workflows as a CI/CD pipeline for automatic deployment for a push to the main branch.

In order to take advantage of the feature you need to create a programmatic access user for github actions on AWS for this project and store the [AWS access credentials in Github secrects](https://github.com/marketplace/actions/configure-aws-credentials-action-for-github-actions).


<!-- LICENSE -->
## License

Distributed under the MIT License.


<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements

* [Celestrak :: Source of up-to-date ISS positional data](https://celestrak.com/NORAD/elements/)
* [Kalwalt ART :: Example usage of JSArtoolkit5 with NFT](https://www.kalwaltart.com/blog/2020/01/21/nft-natural-feature-tracking-with-jsartoolkit5/)
* [NFT Marker Creator :: Tool to create your own NFT marker](https://carnaux.github.io/NFT-Marker-Creator/)
