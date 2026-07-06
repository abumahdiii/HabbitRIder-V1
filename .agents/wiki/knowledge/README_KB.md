# Agent Knowledge Base (KB)

This directory serves as the **long-term memory** and **living documentation** of the system's current state. Its primary goal is to prevent context loss and eliminate the need to re-analyze the entire codebase at the beginning of each agent session.

## Purpose

When agents start a new session or task, they can regain global project context instantly by reading the files in this directory.

## Contents

This directory contains markdown documents describing key aspects of the system, including but not limited to:
*   **Database Schemas & Data Models:** Current structure of tables, collections, relationships, and key data types.
*   **Active API Endpoints:** RESTful paths, request/response formats, and authentication requirements.
*   **UI/Component Trees:** Structure and state management details of frontend components (e.g., Flutter, React).
*   **Hardware & State Machines:** Serial communication protocols, hardware interfaces, and state flow diagrams.
*   **System Architecture:** High-level component interactions, architectural decisions, and dependency graphs.

## Maintenance Policy

> [!IMPORTANT]
> **Keep It Updated:** Whenever a completed task introduces a new architectural component, database schema, core API, or hardware interface, the agent **MUST** silently update the relevant markdown files in this directory to reflect the new system state.
> **No Placeholders:** All documentation must reflect the actual, implemented reality of the project.
