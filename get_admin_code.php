<?php
// get_admin_code.php — Displays the admin security key for authorized registration
require_once 'include/admin_key.php';
$adminKey = getAdminKey();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SwiftFound | Get Admin Code</title>
    <meta name="description" content="Retrieve the SwiftFound admin security key to register as an administrator.">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --primary-purple: #8b8cf7;
            --primary-purple-dim: rgba(139, 140, 247, 0.12);
            --text-white: #ffffff;
            --text-dim: #94a3b8;
            --border-subtle: rgba(255, 255, 255, 0.07);
            --gold: #f59e0b;
            --gold-dim: rgba(245, 158, 11, 0.12);
        }

        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body, html {
            height: 100%;
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-white);
            display: flex;
            align-items: center;
            justify-content: center;
            /* Subtle animated radial glow in background */
            background-image:
                radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139, 140, 247, 0.08) 0%, transparent 70%);
        }

        /* ─── Card ─────────────────────────────────────────────── */
        .code-card {
            background: var(--card-bg);
            padding: 44px 40px 36px;
            border-radius: 24px;
            width: 100%;
            max-width: 420px;
            box-shadow:
                0 25px 60px -12px rgba(0, 0, 0, 0.6),
                0 0 0 1px var(--border-subtle);
            text-align: center;
            animation: fadeUp 0.4s ease both;
        }

        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* ─── Header row ────────────────────────────────────────── */
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
        }

        .brand-logo {
            font-weight: 800;
            font-size: 1.15rem;
            letter-spacing: -0.3px;
        }

        .badge {
            background: var(--primary-purple-dim);
            color: var(--primary-purple);
            padding: 4px 11px;
            border-radius: 6px;
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        /* ─── Icon shield ───────────────────────────────────────── */
        .shield-wrap {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
        }

        .shield-icon {
            width: 64px;
            height: 64px;
            background: var(--primary-purple-dim);
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            border: 1px solid rgba(139, 140, 247, 0.2);
            animation: pulse-glow 2.8s ease-in-out infinite;
        }

        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(139, 140, 247, 0); }
            50%       { box-shadow: 0 0 0 8px rgba(139, 140, 247, 0.12); }
        }

        /* ─── Titles ────────────────────────────────────────────── */
        h1 {
            font-size: 1.65rem;
            font-weight: 800;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }

        .subtitle {
            color: var(--text-dim);
            font-size: 0.875rem;
            line-height: 1.5;
            margin-bottom: 30px;
        }

        /* ─── Notice box ────────────────────────────────────────── */
        .notice-box {
            background: var(--gold-dim);
            border: 1px solid rgba(245, 158, 11, 0.25);
            border-radius: 10px;
            padding: 12px 16px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            text-align: left;
            margin-bottom: 26px;
        }

        .notice-icon {
            font-size: 1rem;
            margin-top: 1px;
            flex-shrink: 0;
        }

        .notice-text {
            font-size: 0.78rem;
            color: var(--gold);
            line-height: 1.5;
        }

        /* ─── Code reveal block ─────────────────────────────────── */
        .code-section label {
            display: block;
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 1.2px;
            color: var(--text-dim);
            text-transform: uppercase;
            margin-bottom: 10px;
            text-align: left;
        }

        .code-display {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #0f172a;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 22px;
            transition: border-color 0.2s;
        }

        .code-display:hover {
            border-color: rgba(139, 140, 247, 0.35);
        }

        .code-value {
            flex: 1;
            font-size: 1.4rem;
            font-weight: 800;
            letter-spacing: 3px;
            color: var(--primary-purple);
            text-align: left;
            filter: blur(6px);
            transition: filter 0.35s ease;
            user-select: none;
        }

        .code-value.revealed {
            filter: blur(0);
            user-select: text;
        }

        /* ─── Reveal / Copy buttons ─────────────────────────────── */
        .btn-row {
            display: flex;
            gap: 10px;
            margin-bottom: 28px;
        }

        .btn {
            flex: 1;
            padding: 13px;
            border-radius: 10px;
            border: none;
            font-family: 'Inter', sans-serif;
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.5px;
            cursor: pointer;
            transition: filter 0.2s, transform 0.15s;
        }

        .btn:active {
            transform: scale(0.97);
        }

        .btn-reveal {
            background: var(--primary-purple);
            color: #fff;
        }

        .btn-reveal:hover {
            filter: brightness(1.12);
        }

        .btn-copy {
            background: rgba(255, 255, 255, 0.06);
            color: var(--text-dim);
            border: 1px solid var(--border-subtle);
        }

        .btn-copy:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
        }

        .btn-copy.copied {
            color: #4ade80;
            border-color: rgba(74, 222, 128, 0.3);
        }

        /* ─── Steps ─────────────────────────────────────────────── */
        .steps {
            text-align: left;
            border-top: 1px solid var(--border-subtle);
            padding-top: 22px;
            margin-bottom: 24px;
        }

        .steps-title {
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 1px;
            color: var(--text-dim);
            text-transform: uppercase;
            margin-bottom: 14px;
        }

        .step-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 10px;
        }

        .step-num {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: var(--primary-purple-dim);
            color: var(--primary-purple);
            font-size: 0.7rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 1px;
        }

        .step-text {
            font-size: 0.82rem;
            color: var(--text-dim);
            line-height: 1.5;
        }

        .step-text a {
            color: var(--primary-purple);
            text-decoration: none;
            font-weight: 600;
        }

        .step-text a:hover {
            text-decoration: underline;
        }

        /* ─── Footer link ───────────────────────────────────────── */
        .card-footer a {
            color: var(--text-dim);
            text-decoration: none;
            font-size: 0.8rem;
            transition: color 0.2s;
        }

        .card-footer a:hover {
            color: var(--text-white);
        }
    </style>
</head>
<body>

    <div class="code-card">

        <!-- Header -->
        <div class="card-header">
            <div class="brand-logo">SwiftFound</div>
            <span class="badge">Admin Access</span>
        </div>

        <!-- Shield icon -->
        <div class="shield-wrap">
            <div class="shield-icon">🛡️</div>
        </div>

        <h1>Admin Security Key</h1>
        <p class="subtitle">Use this code on the Admin Portal to register as an administrator. Keep it confidential.</p>

        <!-- Warning notice -->
        <div class="notice-box">
            <span class="notice-icon">⚠️</span>
            <span class="notice-text">Do not share this key publicly. It grants full administrative access to the SwiftFound platform.</span>
        </div>

        <!-- Code reveal -->
        <div class="code-section">
            <label>Security Key</label>
            <div class="code-display" id="codeDisplay">
                <span class="code-value" id="codeValue"><?php echo htmlspecialchars($adminKey); ?></span>
            </div>
        </div>

        <!-- Action buttons -->
        <div class="btn-row">
            <button class="btn btn-reveal" id="revealBtn" onclick="toggleReveal()">👁 Reveal Key</button>
            <button class="btn btn-copy" id="copyBtn" onclick="copyKey()">📋 Copy</button>
        </div>

        <!-- Steps guide -->
        <div class="steps">
            <div class="steps-title">How to use</div>

            <div class="step-item">
                <div class="step-num">1</div>
                <div class="step-text">Copy the security key above.</div>
            </div>
            <div class="step-item">
                <div class="step-num">2</div>
                <div class="step-text">Go to the <a href="admin.php">Admin Portal →</a></div>
            </div>
            <div class="step-item">
                <div class="step-num">3</div>
                <div class="step-text">Paste the key into the Security Key field and click <strong style="color:#fff;">Authorize Access</strong>.</div>
            </div>
        </div>

        <!-- Back link -->
        <div class="card-footer">
            <a href="home.php">← Back to Homepage</a>
        </div>

    </div>

    <script>
        let isRevealed = false;

        function toggleReveal() {
            const codeVal = document.getElementById('codeValue');
            const revealBtn = document.getElementById('revealBtn');

            isRevealed = !isRevealed;

            if (isRevealed) {
                codeVal.classList.add('revealed');
                revealBtn.textContent = '🙈 Hide Key';
            } else {
                codeVal.classList.remove('revealed');
                revealBtn.textContent = '👁 Reveal Key';
            }
        }

        function copyKey() {
            const key = document.getElementById('codeValue').textContent.trim();
            const copyBtn = document.getElementById('copyBtn');

            navigator.clipboard.writeText(key).then(() => {
                copyBtn.textContent = '✓ Copied!';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.textContent = '📋 Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const el = document.createElement('textarea');
                el.value = key;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                copyBtn.textContent = '✓ Copied!';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.textContent = '📋 Copy';
                    copyBtn.classList.remove('copied');
                }, 2000);
            });
        }
    </script>

</body>
</html>
