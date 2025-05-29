#!/bin/bash

@-
display-mode="1"
screen_name="TCP Port Scan Result"
table_columns="IP Address, Port, Status"
$
echo "10.195.130.1 80 Open"
echo "10.195.130.2 22 Closed"
echo "10.57.6.1 443 Open"
echo "10.57.6.1 443 Open"
echo "10.57.6.2 8080 Closed"
echo "10.195.130.1 80 Open"
echo "10.195.130.2 22 Closed"
echo "10.57.6.1 443 Open"
echo "10.57.6.1 443 Open"
echo "10.57.6.2 8080 Closed"
echo "10.195.130.1 80 Open"
echo "10.195.130.2 22 Closed"
echo "10.57.6.1 443 Open"
echo "10.57.6.1 443 Open"
echo "10.57.6.2 8080 Closed"
echo "10.195.130.1 80 Open"
echo "10.195.130.2 22 Closed"
echo "10.57.6.1 443 Open"
echo "10.57.6.1 443 Open"
echo "10.57.6.2 8080 Closed"

$
-@

@-
display-mode="1"
screen_name="Daniel"
table_columns="total, open, close"
$
ip_address=$(hostname -I | awk '{print $1}')
echo "$ip_address 45 100"
$
-@
@-
display-mode="1"
screen_name="Details About Server"
table_columns="cpu, ram, ipaddress"
$
echo "98% 45% 10.0.0.0"
$
-@
@-
display-mode="2"
screen_name="Owner"
$
echo "this data is to present without table format as just row"
$
-@