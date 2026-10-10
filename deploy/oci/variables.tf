# Filled in automatically by OCI Resource Manager.
variable "tenancy_ocid" {}
variable "region" {}
variable "compartment_ocid" {}

variable "shape" {
  description = "Always Free shapes: VM.Standard.E2.1.Micro (AMD, 1 GB) or VM.Standard.A1.Flex (Arm, more memory but often out of capacity)."
  default     = "VM.Standard.E2.1.Micro"
}

variable "ocpus" {
  description = "A1.Flex only. Always Free allows up to 4 OCPUs in total."
  default     = 1
}

variable "memory_in_gbs" {
  description = "A1.Flex only. Always Free allows up to 24 GB in total."
  default     = 6
}

variable "ssh_public_key" {
  description = "Optional. Paste a public key if you want to log in to the VM yourself."
  default     = ""
}

variable "domain" {
  description = "Optional. Your domain (e.g. vbloom.com). Leave empty to use a free <ip>.sslip.io name."
  default     = ""
}

variable "repo_url" {
  default = "https://github.com/ssvenkateshs/vbloom.git"
}

variable "branch" {
  default = "main"
}
