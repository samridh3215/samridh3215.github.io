---
title: "GOSniff" 
summary: "A network packet analyzer written in Go with real-time web-based visualization"
ShowToc: false
weight: 4
---

## Overview

GOSniff is a network packet analyzer built with Go, designed to capture and analyze network traffic in real-time. This project demonstrates network programming capabilities and provides insights into network communication patterns.

## Features

The application captures network packets by enabling promiscuous mode on the Network Interface Card (NIC) and presents comprehensive packet information through a web-based graphical user interface. Data is streamed to the frontend via WebSocket connections for real-time monitoring.

### Captured Packet Information

- **Protocol**: Identified by OSI layer and port number
- **OSI Layer**: Network stack level of the packet
- **Source IP Address**: Origin of the packet
- **Destination IP Address**: Target of the packet
- **Source MAC Address**: Hardware address of the sender (when applicable)
- **Destination MAC Address**: Hardware address of the receiver (when applicable)

## Technology Stack

- **Language**: Go
- **Networking**: Promiscuous mode packet capture
- **Communication**: WebSocket for real-time data streaming
- **Frontend**: Web-based GUI for packet visualization

## Use Cases

- Network traffic analysis
- Security monitoring
- Protocol debugging
- Educational tool for understanding network communication

[GitHub Repository](https://github.com/samridh3215/Gosniff)
