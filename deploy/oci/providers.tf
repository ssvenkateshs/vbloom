terraform {
  required_version = ">= 1.2"
  required_providers {
    oci = { source = "oracle/oci" }
  }
}

# Resource Manager supplies the credentials; only the region is needed here.
provider "oci" {
  region = var.region
}
