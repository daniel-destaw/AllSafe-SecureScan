#!/bin/bash
DEFAULT_ROUTE=$(ip route show default | awk '/default/ {print $3}')
ping -c 5 $DEFAULT_R