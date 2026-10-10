output "public_ip" {
  value = oci_core_instance.vbloom.public_ip
}

output "site_url" {
  description = "Ready about 10 minutes after Apply finishes (the VM builds the site on first boot)."
  value       = var.domain != "" ? "https://${var.domain}" : "https://${replace(oci_core_instance.vbloom.public_ip, ".", "-")}.sslip.io"
}

output "dns_record" {
  value = var.domain != "" ? "Add an A record: ${var.domain} -> ${oci_core_instance.vbloom.public_ip}" : "Not needed (using sslip.io)."
}
