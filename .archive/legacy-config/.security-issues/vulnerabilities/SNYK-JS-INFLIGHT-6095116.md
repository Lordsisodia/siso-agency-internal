# Vulnerability Report: SNYK-JS-INFLIGHT-6095116

## Overview
**Severity**: Medium (CVSS 6.2)  
**Package**: inflight@1.0.6  
**Issue**: Missing Release of Resource after Effective Lifetime  
**Status**: No fix available (unmaintained package)  

## Technical Details

### Vulnerability ID
- **Snyk ID**: SNYK-JS-INFLIGHT-6095116
- **CWE**: CWE-772 (Missing Release of Resource after Effective Lifetime)
- **CVSS Vector**: CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H/E:P

### Affected Path
```
siso-agency-core@1.0.0 → vite-plugin-pwa@1.0.3 → workbox-build@7.3.0 → glob@7.2.3 → inflight@1.0.6
```

### Description
The `inflight` package contains a memory leak vulnerability in the `makeres` function. The function improperly deletes keys from the `reqs` object after execution of callbacks, causing keys to remain in memory and leading to resource exhaustion.

**Impact**: Can crash the Node.js process or cause application crashes through memory exhaustion.

### Proof of Concept
```javascript
const inflight = require('inflight');

function testInflight() {
  let i = 0;
  function scheduleNext() {
    let key = `key-${i++}`;
    const callback = () => {};
    for (let j = 0; j < 1000000; j++) {
      inflight(key, callback);
    }
    setImmediate(scheduleNext);
  }

  if (i % 100 === 0) {
    console.log(process.memoryUsage());
  }

  scheduleNext();
}

testInflight();
```

## Risk Assessment

### Attack Vector
**Local** - Requires ability to execute or influence asynchronous operations using the inflight module within the application. Not commonly exposed to remote users.

### Likelihood
**Low** - The vulnerability is in a dependency chain (vite-plugin-pwa → workbox-build → glob → inflight) and requires specific conditions to exploit.

### Business Impact
**Medium** - Could cause application instability or crashes if exploited, but limited attack surface.

## Remediation

### Current Status
- ❌ **No direct fix available** - The `inflight` package is unmaintained
- ❌ **No upgrade path** - Dependency is deep in the chain
- ❌ **No patches available**

### Recommended Actions
1. **Monitor for updates** - Watch for updates to `vite-plugin-pwa` that may remove dependency on `glob`
2. **Consider alternatives** - Evaluate if PWA functionality is critical or if alternative implementations exist
3. **Application monitoring** - Monitor memory usage in production for unexpected growth
4. **Rate limiting** - Implement safeguards against excessive asynchronous operations

### Long-term Strategy
- Track upstream dependency changes
- Consider forking `vite-plugin-pwa` if PWA functionality is critical
- Evaluate migration to alternative PWA solutions

## References
- [GitHub Issue](https://github.com/isaacs/inflight/issues/5)
- [GitHub PR](https://github.com/logdna/logdna-agent/pull/157)
- [Snyk Advisory](https://security.snyk.io/vuln/SNYK-JS-INFLIGHT-6095116)

## Last Updated
2025-01-17

## Next Review
2025-02-17 (monthly review recommended)