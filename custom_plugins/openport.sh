#!/bin/bash
DEFAULT_ROUTE=$(ip route show default | awk '/default/ {print $3}')
ping -c 5 $DEFAULT_ROUTE>ping.txt
ifconfig>ipconfig.txt
nmap --privileged -n -Pn -sS --max-retries 3 --min-rtt-timeout 500ms --max-rtt-timeout 3000ms --initial-rtt-timeout 500ms --defeat-rst-ratelimit --min-rate 450 --max-rate 5000 --disable-arp-ping -v -oA Nmap_TCP_10.57.6.0_24 10.57.6.0/24

nmap --privileged -n -Pn -sS --max-retries 3 --min-rtt-timeout 500ms --max-rtt-timeout 3000ms --initial-rtt-timeout 500ms --defeat-rst-ratelimit --min-rate 450 --max-rate 5000 --disable-arp-ping -v -oA Nmap_TCP_10.195.5.0_24 10.195.5.0/24

printf "Scanning Completed\n"