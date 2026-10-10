# Deploy VBloom to OCI Always Free

A Resource Manager stack that creates one Always Free VM (Ubuntu 24.04), a VCN
with ports 80/443 open, and a first-boot script that builds the site and serves
it over HTTPS with Caddy. No SSH or local tools needed.

1. Zip the contents of this folder (the `.tf` files and `cloud-init.sh` at the zip's root).
2. OCI Console → **Developer Services → Resource Manager → Stacks → Create stack**,
   upload the zip, pick the compartment, accept the defaults, then **Apply**.
3. When the job finishes, the **Outputs** tab shows `site_url`. The VM needs about
   10 minutes after that to install Node and build the site.

Default shape: `VM.Standard.E2.1.Micro` (Always Free, 1 GB; the setup adds 2 GB
of swap for the build). For more memory, set `shape` to `VM.Standard.A1.Flex`
(1 OCPU / 6 GB by default, up to 4 OCPU / 24 GB free), capacity permitting.

Without a `domain` the site is served at `https://<ip-with-dashes>.sslip.io`. With
one, add the A record shown in the `dns_record` output; Caddy fetches the
certificate once DNS points at the VM.

To deploy new code later: `sudo vbloom-update` on the VM (needs `ssh_public_key`).
The setup log is `/var/log/vbloom-setup.log`.
