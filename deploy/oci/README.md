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

## Automatic deploys from GitHub

`.github/workflows/deploy.yml` runs after CI passes on `main`: it SSHes to the VM
and runs `sudo vbloom-update`, then checks the site answers. Add these repository
settings (Settings → Secrets and variables → Actions). `VM_HOST`, `VM_USER` and
`VM_SITE_URL` may be variables or secrets; `VM_SSH_KEY` must be a secret:

| Secret | Value |
| --- | --- |
| `VM_HOST` | the VM's public IP, e.g. `193.123.79.202` |
| `VM_USER` | `opc` (Oracle Linux) or `ubuntu` (the stack's Ubuntu VM) |
| `VM_SSH_KEY` | a private key whose public half is in the VM user's `~/.ssh/authorized_keys` |
| `VM_KNOWN_HOSTS` | optional: output of `ssh-keyscan -H <ip>`, to pin the host key |
| `VM_SITE_URL` | optional: `https://yourdomain` once a domain points at the VM |

Use a dedicated deploy key rather than your personal one. The job is skipped while
`VM_HOST`/`VM_USER` are unset, and can be run by hand from the Actions tab.

If the deploy reports that `VM_SSH_KEY` is not a valid private key, store the key
base64-encoded instead; on Windows PowerShell this copies it to the clipboard:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\key")) | Set-Clipboard
```
