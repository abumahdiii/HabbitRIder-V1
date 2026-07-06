# Rule: Unified System-Level Debug Logging Standard

**Description:** Rules governing the integration of system-level debug logs in runtime debugging, ensuring guarded execution under `DEV_MODE` to avoid log pollution in production environments.

## 1. DEV_MODE Guard Requirement
- All runtime debug logs (e.g., tracking raw hardware data, variable states, and API payloads) MUST be wrapped in a conditional check verifying that the `DEV_MODE` environment variable is `true`.
- This logging mechanism is strictly for testing and debugging, and is distinct from high-level project management progress logs.
- Guarded logs must cover both **complex** and **medium-complexity** business logic. Most logic execution events should be logged to make it easy to understand state changes and flow execution during testing.

### Language-Specific Examples
- **Go (Golang):**
  ```go
  if os.Getenv("DEV_MODE") == "true" {
      log.Printf("DEBUG: API payload: %s", payload)
  }
  ```
- **Flutter (Dart):**
  ```dart
  if (const String.fromEnvironment('DEV_MODE') == 'true') {
      debugPrint('DEBUG: Widget state changed: $state');
  }
  ```
- **Django (Python):**
  ```python
  import os
  if os.environ.get('DEV_MODE') == 'true':
      logger.debug(f"DEBUG: Hardware response payload: {payload}")
  ```

## 2. Hardware and Serial Data Streams
- When parsing raw data streams or serial port buffers (e.g., catching null bytes, framing issues, or parsing partial frames), explicit guarded logs MUST be implemented.
- The logs must dump buffer contents and state variables to allow deep tracing of communication streams.

## 3. Scope of Logging
- **High-Complexity Code:** Hardware parsers, cryptographic modules, custom protocol implementations, and transaction-critical workflows.
- **Medium-Complexity Code:** Standard controllers/handlers, model state changes, state machines, API routing decisions, and validation steps.
- **Error Boundaries:** Catch blocks, recovery loops, serial timeout handlers, and network reconnection attempts must log full details under `DEV_MODE=true`.
