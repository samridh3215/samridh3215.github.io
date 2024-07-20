---
title: "GOSniff" 
summary: "A simple packet sniffer written in GO"
ShowToc: false
weight: 4
---

This project was my first shot at GO.
This project sniffs all the packet in the local network, by turning on promiscuous mode on NIC (network interface card), and displays all the relevant information on a web based GUI (graphical user interface), by establishing a web socket connection and stream all the information about packets via this connection.

The information about packets include the following

- Protocol (identified by layer and port number)
- OSI layer
- Source IP Address
- Destination IP Address
- Source MAC Address (if applicable)
- Destination MAC Address (if applicable)

[GitHub](https://github.com/samridh3215/Gosniff)
