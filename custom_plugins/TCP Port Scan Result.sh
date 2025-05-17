plugin-title=TCP Port Scan Result
table-columns=IP Address, Port, Status
SUBNETS=("10.195.130.0/24" "10.57.6.0/24")

for SUBNET in "${SUBNETS[@]}"; do
  echo "Scanning Subnet: $SUBNET"
  nmap -sT $SUBNET | awk '
  /Nmap scan report for/ {ip=$NF}
  /open/ {print ip, $1, "Open"}
  /closed/ {print ip, $1, "Closed"}'
done
