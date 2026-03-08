---
title: "GenieTest: Functional Test Generation Tool using AI"
summary: "An AI-powered functional test generation tool that helps Quality Engineering (QE) professionals fast-track the process of writing test automation scripts by overcoming the limitations of standard coding assistants."
ShowToc: false
weight: 1
featured: true
---

## Overview

GenieTest is an intelligent tool designed to assist Quality Engineering (QE) professionals in fast-tracking the process of writing test automation scripts. While standard AI assistants like Cursor are helpful, they often lack project-specific context and reliability in large-scale repositories. GenieTest bridges this gap by utilizing a custom Model Context Protocol (MCP) server, tailored Cursor Rules, and specialized RAG (Retrieval-Augmented Generation) databases.

## Key Features

- **Steps Generator:** Breaks down user input into structured testing steps via LLM calls.
- **Show Closest Test:** Uses vector search over a Test Functions database to find the existing test that closest matches the prompt.
- **Context-Aware Code Generation:** Generates new code by utilizing the closest test as a template, along with intelligently fetched helper functions.
- **Review and Edit Tool:** Edits existing tests by automatically pulling in context from similar tests and relevant helper functions to ensure correctness.

## Technology Stack

- **Integrations:** OpenAI Batch API, Snowflake Arctic (for embeddings)
- **Tooling:** Cursor IDE, MCP (Model Context Protocol) Server and Client
- **Databases:** Custom RAG databases for Test Functions and Helper Functions

