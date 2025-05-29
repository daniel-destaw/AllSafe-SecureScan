#!/bin/bash

@-
display-mode="1"
screen_name="TCP Port Scan Result"
table_columns="IP Address, Port, Status"
$

for ip in 10.57.6.{1..254}; do
  for port in 22 80 443 8080; do
    timeout 1 bash -c "echo >/dev/tcp/$ip/$port" 2>/dev/null && \
    echo "$ip $port Open" || \
    echo "$ip $port Closed"
  done
done

$
-@
