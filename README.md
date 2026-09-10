# 🔐 Network Security Port Scanner

A basic web-based **Network Security Port Scanner** designed to demonstrate the fundamental concepts of network security and port scanning.

The application allows a user to provide a target, select a range of ports, perform a scan, and view whether the selected ports are **open or closed**. It also provides input validation and error handling to make the scanning process simple and understandable.

## 🌐 Live Demo

**Project:** [Network Security Port Scanner](https://port-scanner-1.ai.studio/)

> **⚠️ Authorized Use Only:** Use this application only on systems, devices, servers, or networks that you own or have explicit permission to test. Port scanning unauthorized systems may violate laws, policies, or terms of service.

---

# 📌 Table of Contents

* [About the Project](#-about-the-project)
* [Problem Statement](#-problem-statement)
* [Objectives](#-objectives)
* [Features](#-features)
* [How Port Scanning Works](#-how-port-scanning-works)
* [Application Workflow](#-application-workflow)
* [Target Input](#-target-input)
* [Port Range Selection](#-port-range-selection)
* [Port Scanning](#-port-scanning)
* [Open and Closed Ports](#-open-and-closed-ports)
* [Results](#-results)
* [Error Handling](#-error-handling)
* [Example](#-example)
* [Technical Concepts](#-technical-concepts)
* [Algorithm](#-algorithm)
* [Pseudocode](#-pseudocode)
* [Security Considerations](#-security-considerations)
* [Limitations](#-limitations)
* [Testing](#-testing)
* [Future Enhancements](#-future-enhancements)
* [Learning Outcomes](#-learning-outcomes)
* [Project Requirements Mapping](#-project-requirements-mapping)
* [Conclusion](#-conclusion)
* [Disclaimer](#-disclaimer)

---

# 📖 About the Project

The **Network Security Port Scanner** is an educational project that demonstrates how port scanning can be used as a basic network-security and network-diagnostics technique.

Every networked computer or server can provide services through numbered **ports**. A port scanner checks whether specific ports on a target system can accept network connections.

For example, commonly used ports include:

| Port | Common Service   |
| ---- | ---------------- |
| 21   | FTP              |
| 22   | SSH              |
| 23   | Telnet           |
| 25   | SMTP             |
| 53   | DNS              |
| 80   | HTTP             |
| 110  | POP3             |
| 143  | IMAP             |
| 443  | HTTPS            |
| 3306 | MySQL            |
| 5432 | PostgreSQL       |
| 8080 | Alternative HTTP |

The project focuses on the basic scanning process rather than advanced penetration-testing techniques.

---

# 🎯 Problem Statement

Network administrators and security students need a simple way to understand which network ports are accessible on a system.

Manually checking a large number of ports is inefficient. A port scanner automates this process by checking a specified range of ports and presenting the results in an easy-to-understand format.

The goal of this project is therefore to create a simple application that can:

1. Accept a target.
2. Accept a port range.
3. Scan the selected ports.
4. Determine whether ports are open or closed.
5. Display the results clearly.
6. Handle invalid input and scanning errors.

---

# 🎯 Objectives

The main objectives of the project are:

* To understand basic network-security concepts.
* To understand IP addresses and port numbers.
* To demonstrate port scanning.
* To allow users to specify a scanning target.
* To allow users to select a port range.
* To identify open and closed ports.
* To display scan results clearly.
* To implement basic error handling.
* To provide a simple and accessible interface.
* To demonstrate responsible and authorized security testing.

---

# ✨ Features

## 1. Target Input

The application allows the user to specify the target system that needs to be scanned.

A target may generally be represented by:

* An IP address
* A hostname/domain

Example:

```text
127.0.0.1
```

or:

```text
localhost
```

The target identifies the host whose ports are going to be checked.

---

## 2. Port Range Selection

The user can specify which ports should be scanned.

For example:

```text
Start Port: 1
End Port: 100
```

The scanner checks the ports:

```text
1, 2, 3, 4, ... 100
```

This makes the scanner more flexible than a tool that only checks a fixed list of ports.

---

## 3. Port Scanning

The application attempts to determine whether each selected port is accessible.

Conceptually, the process is:

```text
Target IP + Port
       ↓
Connection Attempt
       ↓
 ┌─────┴─────┐
 ↓           ↓
Success     Failure
 ↓           ↓
OPEN       CLOSED
```

The scanner repeats this process for every port in the selected range.

---

## 4. Open/Closed Port Identification

The application categorizes scanned ports based on the result of the connection attempt.

### Open

An open port indicates that the target accepted the connection attempt.

This generally means that a service may be listening on that port.

Example:

```text
Port 80 → OPEN
```

### Closed

A closed result indicates that the scanner could not establish the expected connection.

This can occur because:

* No service is listening.
* The connection was refused.
* The port is inaccessible.
* A firewall or network configuration prevents the connection.
* The target did not respond within the expected time.

Therefore, a closed result should be understood as:

> The scanner could not establish a connection to that port.

---

# 🔄 How Port Scanning Works

The basic scanning process can be represented as:

```text
             START
               │
               ▼
       Enter Target Host
               │
               ▼
       Enter Port Range
               │
               ▼
        Validate Input
               │
          ┌────┴────┐
          │         │
        Valid     Invalid
          │         │
          ▼         ▼
     Start Scan   Show Error
          │
          ▼
   Select Next Port
          │
          ▼
 Attempt Connection
          │
     ┌────┴────┐
     │         │
  Success    Failure
     │         │
     ▼         ▼
   OPEN      CLOSED
     │         │
     └────┬────┘
          │
          ▼
    More Ports?
       │     │
      Yes    No
       │     │
       └─┐   ▼
         │ Display Results
         │      │
         └──────┘
                │
                ▼
               END
```

---

# 🖥️ Application Workflow

The general workflow of the application is:

### Step 1 — Enter Target

The user provides the hostname or IP address to scan.

### Step 2 — Select Port Range

The user specifies the beginning and ending port numbers.

### Step 3 — Validate Input

The application verifies that the supplied information is usable.

### Step 4 — Start Scan

The scanner checks the selected ports.

### Step 5 — Determine Port Status

Each port is classified based on the connection result.

### Step 6 — Display Results

The application presents the scan results in a clear format.

### Step 7 — Handle Errors

If an invalid target, port range, or network error occurs, the application displays an appropriate error message instead of failing silently.

---

# 🎯 Target Input

The target represents the host whose network ports are being tested.

Examples include:

```text
127.0.0.1
```

```text
localhost
```

or an authorized server/domain.

### Why target validation is important

A scanner should validate user input before attempting a scan.

Invalid target information can result in:

* Failed DNS resolution
* Invalid network requests
* Unnecessary scanning attempts
* Confusing results
* Application errors

---

# 🔢 Port Range Selection

TCP and UDP port numbers use the range:

```text
1 - 65535
```

The project allows the user to select the portion of this range that should be examined.

For example:

```text
Start: 20
End: 100
```

means that the scanner checks:

```text
20 → 21 → 22 → ... → 100
```

### Why use a custom range?

A custom range allows users to:

* Perform a quick scan.
* Focus on a specific group of ports.
* Test a known service.
* Reduce unnecessary scanning.
* Experiment with different port ranges in a laboratory environment.

---

# 🔍 Port Scanning

The core operation of the project is checking the selected ports.

For a TCP-based connection test, the conceptual operation is:

```text
Scanner
   |
   | Connection Request
   |
   ▼
Target Host : Port
   |
   ├── Connection Accepted
   │          ↓
   │        OPEN
   │
   └── Connection Failed
              ↓
           CLOSED
```

The process is repeated until every port in the selected range has been checked.

---

# 📊 Results

The results should be presented in a clear and understandable manner.

A conceptual result may look like:

```text
----------------------------------------
           SCAN RESULTS
----------------------------------------

Target: 127.0.0.1
Port Range: 1 - 100

Port       Status
--------------------------------
21         CLOSED
22         OPEN
23         CLOSED
80         OPEN
81         CLOSED
443        OPEN

----------------------------------------
Open Ports: 3
Closed Ports: 3
----------------------------------------
```

The result allows the user to quickly identify which ports responded as accessible.

---

# 📌 Understanding Open Ports

An open port means that a connection was successfully established.

For example:

```text
80 → OPEN
```

may indicate that an HTTP service is available.

Similarly:

```text
443 → OPEN
```

may indicate an HTTPS service.

However, the scanner should not automatically assume which exact application is running unless service detection is implemented.

An open port is not automatically a vulnerability.

It simply means that a service is reachable through that port.

---

# 📌 Understanding Closed Ports

A closed port means that the scanner could not establish the expected connection.

For example:

```text
8080 → CLOSED
```

may indicate that:

* No service is listening.
* The service is unavailable.
* The connection was refused.
* Network controls prevented the connection.

The exact reason cannot always be determined by a basic port scanner.

---

# ⚠️ Error Handling

Error handling is an important part of the project.

The application should respond gracefully to invalid or unexpected input.

## Invalid Port Number

Example:

```text
Start Port: 0
```

Expected behavior:

```text
Invalid port number.
Port must be between 1 and 65535.
```

---

## Port Greater Than 65535

Example:

```text
End Port: 70000
```

Expected behavior:

```text
Invalid port number.
Port must be between 1 and 65535.
```

---

## Invalid Range

Example:

```text
Start Port: 500
End Port: 100
```

Expected behavior:

```text
Invalid port range.
Starting port must not be greater than ending port.
```

---

## Invalid Target

If the supplied hostname or IP address cannot be resolved or is otherwise invalid, the application should display an appropriate error.

Example:

```text
Unable to resolve target.
Please enter a valid hostname or IP address.
```

---

## Network Error

A network failure should not terminate the entire scan unnecessarily.

Instead, the application should report the problem and continue where appropriate.

---

# 🧪 Example Usage

Consider an authorized local testing environment.

The user enters:

```text
Target:
127.0.0.1
```

and selects:

```text
Start Port:
1

End Port:
100
```

The application scans ports 1 through 100.

A possible result could be:

```text
========================================
          PORT SCAN RESULTS
========================================

Target: 127.0.0.1
Range: 1 - 100

Port        Status
--------------------------------
22          OPEN
23          CLOSED
25          CLOSED
53          CLOSED
80          OPEN
443         OPEN

--------------------------------
Scan Complete
--------------------------------
```

The exact results depend on which services are running on the target system.

---

# 🧠 Technical Concepts

## IP Address

An IP address identifies a network interface or host.

Example:

```text
192.168.1.10
```

---

## Hostname

A hostname provides a human-readable name for a network host.

Example:

```text
localhost
```

A hostname can be resolved into an IP address through DNS or local name-resolution mechanisms.

---

## Port

A port is a logical endpoint used by network applications.

Port numbers allow multiple network services to operate on the same host.

For example:

```text
192.168.1.10:80
192.168.1.10:443
192.168.1.10:22
```

represent different service endpoints on the same host.

---

## TCP

TCP is a connection-oriented transport protocol.

A TCP client attempts to establish a connection with a service listening on a particular port.

This makes TCP connection testing useful for basic port scanning.

---

## Socket

A socket represents an endpoint for network communication.

A TCP connection can conceptually be identified using:

```text
IP Address + Port
```

For example:

```text
127.0.0.1:8080
```

---

# 🧮 Algorithm

```text
1. Start application.

2. Read target hostname/IP.

3. Read starting port.

4. Read ending port.

5. Validate target.

6. Validate starting and ending ports.

7. Verify that:
      1 <= startPort <= 65535
      1 <= endPort <= 65535
      startPort <= endPort

8. Begin scanning.

9. For every port from startPort to endPort:

      a. Attempt a connection.

      b. If connection succeeds:
             Mark port OPEN.

      c. Otherwise:
             Mark port CLOSED.

10. Store/display the result.

11. Continue until the ending port is reached.

12. Display final scan results.

13. End program.
```

---

# 📝 Pseudocode

```text
START

DISPLAY application title

INPUT target

INPUT startPort
INPUT endPort

IF target is invalid
    DISPLAY "Invalid target"
    STOP
END IF

IF startPort < 1 OR startPort > 65535
    DISPLAY "Invalid starting port"
    STOP
END IF

IF endPort < 1 OR endPort > 65535
    DISPLAY "Invalid ending port"
    STOP
END IF

IF startPort > endPort
    DISPLAY "Invalid port range"
    STOP
END IF

FOR port = startPort TO endPort

    TRY

        Attempt TCP connection to target:port

        IF connection succeeds
            status = OPEN
        ELSE
            status = CLOSED
        END IF

    CATCH connection error

        status = CLOSED

    END TRY

    DISPLAY port and status

END FOR

DISPLAY "Scan completed"

END
```

---

# 🔐 Security Considerations

Port scanning is a legitimate technique used in network administration and security assessments.

It can help administrators:

* Identify exposed services.
* Verify firewall configurations.
* Detect unnecessary network services.
* Check whether intended ports are reachable.
* Understand a system's network attack surface.

However, port scanning can also be used as an initial reconnaissance technique by attackers.

For this reason, the project should be used only for:

* Educational laboratories.
* Personal systems.
* Authorized penetration testing.
* Systems where explicit permission has been obtained.

---

# ⚠️ Ethical Use

**Do not scan systems simply because they are publicly accessible.**

Public accessibility does not mean permission has been granted.

Before scanning a target, ensure that:

```text
You own the system
       OR
You have explicit authorization
```

A responsible security workflow is:

```text
Permission
    ↓
Define Scope
    ↓
Scan
    ↓
Analyze Results
    ↓
Fix Issues
    ↓
Verify Again
```

---

# 🚧 Limitations

This is a **basic port scanner** and is not intended to replace professional security-testing tools.

## 1. Basic Port Status Detection

The scanner primarily determines whether a connection can be established.

It does not necessarily determine why a port failed.

---

## 2. No Vulnerability Assessment

The project does not automatically determine whether an open service contains a vulnerability.

For example:

```text
Port 22 → OPEN
```

does not mean:

```text
SSH → VULNERABLE
```

An open port only indicates accessibility.

---

## 3. No Advanced Service Detection

The basic implementation does not necessarily identify:

```text
Service name
Service version
Operating system
Application framework
```

unless those capabilities are explicitly added.

---

## 4. TCP Scanning Focus

The project is intended to demonstrate basic port scanning and does not constitute a comprehensive TCP/UDP security scanner.

---

## 5. Firewall Effects

Firewalls and network security devices can influence scan results.

A connection may fail because of:

```text
Target configuration
Firewall
Network filtering
Routing
Service availability
Timeout
```

Therefore, scan results must be interpreted carefully.

---

# 🧪 Testing

The application should be tested with multiple input conditions.

| Test Case          | Input                     | Expected Result        |
| ------------------ | ------------------------- | ---------------------- |
| Valid target       | `127.0.0.1`               | Scan starts            |
| Valid hostname     | `localhost`               | Target is resolved     |
| Small range        | `1-10`                    | Ten ports checked      |
| Web range          | `80-443`                  | Selected ports checked |
| Invalid start port | `0`                       | Error displayed        |
| Invalid end port   | `70000`                   | Error displayed        |
| Reversed range     | `100-1`                   | Error displayed        |
| Invalid target     | Invalid hostname          | Target error           |
| Open service       | Authorized active service | Port reported open     |
| Unused port        | Authorized unused port    | Port reported closed   |

---

# 🏗️ Project Requirements Mapping

The original project requirements are directly addressed by the application:

| Requirement                    | Project Implementation                                    |
| ------------------------------ | --------------------------------------------------------- |
| **Target input**               | User provides the host/IP to scan                         |
| **Port range selection**       | User specifies starting and ending ports                  |
| **Port scanning**              | Application checks each selected port                     |
| **Open/closed identification** | Connection result is classified                           |
| **Clear results**              | Scan results are displayed in a structured format         |
| **Error handling**             | Invalid inputs and scanning failures are handled          |
| **Documentation**              | Complete project documentation is provided in this README |

---

# 🔮 Future Enhancements

The project can be extended with additional security and networking capabilities.

## 1. Service Detection

Identify the service running behind an open port.

Example:

```text
22  → SSH
80  → HTTP
443 → HTTPS
```

---

## 2. Multithreaded Scanning

Multiple ports can be tested concurrently to reduce scanning time.

Conceptually:

```text
Thread 1 → Port 80
Thread 2 → Port 81
Thread 3 → Port 82
Thread 4 → Port 83
```

A production implementation would also need appropriate concurrency limits and timeout handling.

---

## 3. UDP Scanning

Support could be added for UDP services such as DNS and SNMP.

---

## 4. Result Export

The application could allow users to export results as:

```text
CSV
JSON
TXT
PDF
```

---

## 5. Scan History

Previous authorized scans could be stored so that users can compare changes over time.

---

## 6. Graphical Reports

Results could be represented using:

* Tables
* Charts
* Open-port summaries
* Service categories
* Security recommendations

---

## 7. Advanced Security Analysis

A future version could provide additional information such as:

```text
Port
Service
Protocol
Risk Level
Recommendation
```

This should remain focused on authorized defensive assessment.

---

# 📚 Learning Outcomes

After completing this project, a student should be able to explain:

### Networking

* What an IP address is.
* What a hostname is.
* What a network port is.
* Difference between hosts and services.
* Basic TCP communication.

### Network Security

* What port scanning means.
* Why exposed ports matter.
* How security professionals inventory network exposure.
* Why unnecessary services should be restricted.

### Programming

* User input handling.
* Input validation.
* Network communication.
* Exception/error handling.
* Loops and range processing.
* Result presentation.

### Cybersecurity Ethics

* Difference between authorized and unauthorized scanning.
* Importance of defining testing scope.
* Responsible use of security tools.

---

# 📸 Suggested Project Screenshots

For a college/project submission, the following screenshots can be added to the README:

### 1. Home Page

Show the application's main interface.

```text
Target Input
Port Range
Scan Button
```

### 2. Scan in Progress

Show the application while the scan is running.

### 3. Scan Results

Show:

```text
Open Ports
Closed Ports
Target
Port Range
```

### 4. Error Handling

Show an example of invalid input and the corresponding error message.

Screenshots can be stored in:

```text
screenshots/
├── home.png
├── scanning.png
├── results.png
└── error.png
```

and included in Markdown using:

```markdown
![Application Interface](screenshots/home.png)
```

---

# 📂 Suggested Repository Structure

```text
Network-Security-Port-Scanner/
│
├── README.md
│
├── src/
│   └── ...
│
├── screenshots/
│   ├── home.png
│   ├── scanning.png
│   ├── results.png
│   └── error.png
│
└── docs/
    └── project-report.md
```

---

# 📌 Why Port Scanning Matters

Port scanning is one of the basic techniques used when understanding a system's network exposure.

A system might expose several services:

```text
                SERVER
                  │
        ┌─────────┼─────────┐
        │         │         │
       :22       :80       :443
        │         │         │
       SSH       HTTP      HTTPS
```

Each exposed service increases the number of network endpoints that need to be properly configured and secured.

The objective of security testing is not simply:

> "Find as many open ports as possible."

Instead, the goal is to understand:

> **Which services are exposed, whether that exposure is intentional, and whether the configuration is appropriate?**

---

# 🏁 Conclusion

The **Network Security Port Scanner** provides a simple demonstration of how network ports can be checked programmatically.

The complete process can be summarized as:

```text
        TARGET
           ↓
     PORT RANGE
           ↓
    INPUT VALIDATION
           ↓
      PORT SCANNING
           ↓
   ┌───────┴────────┐
   ↓                ↓
 OPEN             CLOSED
   │                │
   └───────┬────────┘
           ↓
      CLEAR RESULTS
           ↓
       ANALYSIS
```

The project demonstrates important foundations of network security while remaining simple enough for students to understand and extend.

It provides practical exposure to:

* Networking
* TCP connections
* Ports
* Socket-based communication
* Input validation
* Error handling
* Security testing
* Responsible cybersecurity practices

The project can subsequently be expanded with service detection, multithreading, UDP support, result exporting, graphical reporting, and other authorized security-assessment capabilities.

---

# ⚠️ Disclaimer

This project is intended for **educational purposes and authorized security testing only**.

Only scan systems that you own or have explicit permission to test.

The developer does not encourage unauthorized network scanning, intrusion, exploitation, or attempts to access systems without permission.

---

# 🌐 Project Link

**Live Application:**
https://port-scanner-1.ai.studio/

---

## 👨‍💻 Project Information

| Field           | Details                                                             |
| --------------- | ------------------------------------------------------------------- |
| Project Name    | Network Security Port Scanner                                       |
| Category        | Network Security / Cybersecurity                                    |
| Project Type    | Educational Web Application                                         |
| Primary Purpose | Port scanning demonstration                                         |
| Main Operations | Target input, port-range selection, scanning, result identification |
| Output          | Open/closed port information                                        |
| Usage           | Educational and authorized security testing                         |

---

**Made for learning network security, responsible security testing, and practical networking concepts.**
