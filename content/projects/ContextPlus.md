---
title: "ContextPlus"
summary: "An MCP server that gives coding agents repository-aware context retrieval, cutting the prompts needed to reach production-ready code from 4-8 down to 1-2"
ShowToc: false
weight: 2
featured: true
---

## Overview

ContextPlus is an internal tooling project: a Model Context Protocol (MCP) server that gives AI coding agents repository-aware context retrieval. Instead of a coding assistant working from whatever files happen to be open, ContextPlus surfaces the parts of the codebase actually relevant to the task — existing helper functions, conventions, and patterns — so generated code fits the codebase on the first pass.

## Impact

Used day-to-day with Cursor, ContextPlus reduced the number of prompts needed to reach production-ready code from **4–8 down to 1–2**, cutting a long back-and-forth iteration loop down to something close to a single well-scoped request.

## Key Features

- **Repository-Aware Context Retrieval**: Automatically surfaces relevant code context from across the repository, not just open files
- **MCP Server Architecture**: Built as a Model Context Protocol server that plugs directly into coding agent workflows
- **Cursor Integration**: Used in production with Cursor to accelerate day-to-day engineering work
