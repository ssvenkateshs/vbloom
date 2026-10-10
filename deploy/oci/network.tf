resource "oci_core_vcn" "vbloom" {
  compartment_id = var.compartment_ocid
  cidr_blocks    = ["10.0.0.0/16"]
  display_name   = "vbloom-vcn"
  dns_label      = "vbloom"
}

resource "oci_core_internet_gateway" "vbloom" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.vbloom.id
  display_name   = "vbloom-igw"
}

resource "oci_core_route_table" "vbloom" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.vbloom.id
  display_name   = "vbloom-routes"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.vbloom.id
  }
}

resource "oci_core_security_list" "vbloom" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.vbloom.id
  display_name   = "vbloom-web"

  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  dynamic "ingress_security_rules" {
    for_each = [22, 80, 443]
    content {
      source   = "0.0.0.0/0"
      protocol = "6"
      tcp_options {
        min = ingress_security_rules.value
        max = ingress_security_rules.value
      }
    }
  }
}

resource "oci_core_subnet" "vbloom" {
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.vbloom.id
  cidr_block        = "10.0.1.0/24"
  display_name      = "vbloom-public"
  dns_label         = "web"
  route_table_id    = oci_core_route_table.vbloom.id
  security_list_ids = [oci_core_security_list.vbloom.id]
}
