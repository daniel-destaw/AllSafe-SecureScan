#!/bin/bash

@-
display-mode="1"
screen_name="TCP Port Scan Result"
table_columns="IP Address, Port, Status"
$

# Use nmap to scan common TCP ports on subnet 10.2.10.77/24
for ip in $(nmap -n -sP 10.2.10.0/24 | awk '/Nmap scan report/{print $5}'); do
    ports=$(nmap -n -p 1-1024 --open $ip | awk '/^PORT/{flag=1; next} /Nmap done/{flag=0} flag {print $1}' | cut -d'/' -f1)
    for port in $ports; do
        echo "$ip $port Open"
    done
done

$
-@


