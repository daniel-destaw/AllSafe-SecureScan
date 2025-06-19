# AllSafe-SecureScan# Allsafe SecureScan – Modular Server Management & Security Scanner

**Allsafe SecureScan** is a powerful, plugin-based server management and scanning platform built for DevOps teams, system administrators, and cybersecurity professionals. It enables automated health checks, network scanning, service validation, and more — all through a customizable plugin system.

![Allsafe Logo](./public/allsafe-banner.png)

---

## 🔑 Why Allsafe?

- 🧩 **Plugin-Based Architecture** – Add custom logic easily without modifying the core.
- ⚙️ **Server Resource Management** – Register and validate multiple hosts via SSH.
- 📊 **Scan Automation** – Use or build scanning plugins for ports, processes, vulnerabilities, and configurations.
- 🔐 **Authentication Ready** – Integrates with [`allsafe-auth`](https://pypi.org/project/allsafe-auth/) for secure access control.
- 📈 **Web UI** – Built with **Next.js**, **React**, and **Tailwind CSS** for responsive monitoring.

---

## 📦 Submodules

| Module         | Description                                           | Installation                        |
|----------------|-------------------------------------------------------|-------------------------------------|
| `allsafe-web`  | Frontend dashboard built with Next.js                | Included in this repo               |
| `allsafe-auth` | Lightweight Python auth library for Allsafe plugins  | `pip install allsafe-auth`         |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/daniel-destaw/AllSafe-SecureScan.git
cd AllSafe-SecureScan/nextjs-base
