# AI Usage & Disclosure Log (Frontend UI Core)

**Developer Identity Notice:** This specific log captures the AI development metrics and code generation sequences authorized and written exclusively by me. It tracks my individual technical contributions to the platform's presentation layout layers. Other project team members maintain separate logs for their respective components.

**General Framework Caveat:** Given that GitHub Copilot operates as an ephemeral, live inline autocomplete utility, this document covers the major UI development tracking milestones and might miss minor single-line adjustments. 

**Strict Operational Boundaries:** As a strict architectural rule, **AI utilities were completely restricted from generating backend server-side scripts or defining critical program workflows.** I retained absolute structural control over the core execution engine and drawing flows. When building data components, I personally handled the data intake queries from the database, established the processing structures, and passed my own loaded variables down to the client. Copilot was used strictly to generate the HTML element construction, CSS style classes, and presentation layouts required to draw those pre-loaded datasets onto the screen.

---

### Project Component: Responsive Layout & Member Dashboard UI  
**AI Tool Used:** GitHub Copilot (Inline Autocomplete)  

#### 1. The Intent
I needed to create a grid system layout for the Member Dashboard that dynamically scales the four main metric statistic blocks (`Posted Items`, `Active Claims`, etc.) across mobile devices, tablets, and desktop monitors using Tailwind CSS / vanilla CSS utility classes.

#### 2. The Interaction (Prompting)
I set up the initial skeleton element and typed a layout comment indicator: ``. Copilot automatically completed the block, predicting the column span utilities for the media queries.

#### 3. The Output & Verification
The generated grid code worked perfectly on desktop views, but when testing mobile scalability through Chrome DevTools responsive emulation mode, the grid items squished together and truncated the numeric text strings.

#### 4. Human Refinement
I threw out its hardcoded horizontal pixel parameters and replaced them with flex-wrap and responsive grid width rules (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`), adjusting the inner padding so the layout stayed clean on small phone screens.

---

### Project Component: Live Chat UI Conversation Elements & Message Containers  
**AI Tool Used:** GitHub Copilot Chat  

#### 1. The Intent
I wanted to code the user interface layout inside the chat dashboard so that messages sent by the logged-in user appear styled in blue and aligned to the right side of the screen, while incoming community messages appear styled in white/light grey and aligned to the left.

#### 2. The Interaction (Prompting)
I highlighted the text wrapper div and prompted Copilot Chat: *"Write the CSS classes to align messages right and style them blue if sent by current user, else align left and style them grey."*

#### 3. The Output & Verification
Copilot provided working conditional styling tags. However, it placed a fixed, rigid width on the message text box blocks. This caused longer paragraphs of text to break out of the chat bubbles and clip beneath the sidebar container.

#### 4. Human Refinement
I stripped out the rigid width rules, applied `max-w-[70%]` and `word-break: break-word` attributes to the bubble classes, and manually coded the absolute bottom layout anchoring for the yellow alert notice boxes (`Chat is not open yet...`).

---

### Project Component: Item Card Rendering & Dynamic Client Filtering  
**AI Tool Used:** GitHub Copilot Chat  

#### 1. The Intent
I needed a fast client-side execution loop to draw item listings onto the browsing feed and filter them instantly without page refreshes. To maintain absolute control over the drawing flow, I personally coded the backend PHP functions to fetch the records from the database and loaded them into a JavaScript object array variable myself. I then wanted to use Copilot to map that custom variable into individual HTML card containers.

#### 2. The Interaction (Prompting)
I highlighted my custom data variable and prompted Copilot Chat: *"Take this loaded items array variable and write a loop that draws them onto the screen as graphical card components, then filter their visibility using the search input value."*

#### 3. The Output & Verification
The AI provided a standard card template structure using `.toLowerCase().includes()`. The item cards rendered correctly on page load, but checking multi-state filtering boxes (like matching both `Resolved` and `Owner Confirm` rows simultaneously) caused the feed to crash because its generated conditional logic used strict, exclusive match checking loops.


---

### Project Component: Real-Time Chat Contact Sidebar & Status Filter Tabs  
**AI Tool Used:** GitHub Copilot Chat  

#### 1. The Intent
The chat page needed a two-tab sidebar — one for claims I made, one for claim requests on my posted items — where each contact card showed the latest message preview, an unread badge, and a small item thumbnail. I built the underlying data structures and the contact aggregation logic myself, loading and grouping messages by claim ID. I then needed Copilot to generate the card HTML template and the tab switching presentation layer.

#### 2. The Interaction (Prompting)
I passed my assembled contact object structure to Copilot Chat and asked: *"Generate a contact card HTML template using these fields: username, item title, last message preview, unread count, claim status, and item thumbnail image."*

#### 3. The Output & Verification
Copilot generated a clean card layout. However, it hard-coded the contact type tab filtering using simple `display: none` toggling directly on the HTML elements, which broke when I introduced the secondary status filter row (All, Chatting, Pending, Owner Confirm, Archive). The two filter layers conflicted and contacts would disappear when both filters were applied at the same time.

#### 4. Human Refinement
I rewrote the entire `updateContactsDisplay()` function myself to evaluate both `data-contact-type` and `data-chat-status` attributes simultaneously on each contact element, computing a single `shouldShow` boolean from both active filter states before applying visibility. I also added the archive dropdown submenu logic and the `forceOpenFirst` parameter to control auto-activation behaviour.

---

### Project Component: Reputation Progress Bar & Tier Display  
**AI Tool Used:** GitHub Copilot Chat  

#### 1. The Intent
I wanted a visual reputation card on the dashboard showing the user's current tier badge, a live progress bar filling between the current tier's minimum and the next tier's threshold, and a row of tier dots highlighting the active one. I already had the reputation integer loaded from the session and passed into the JavaScript context myself.

#### 2. The Interaction (Prompting)
I described the five tiers (CAUTION, NOVICE, HELPFUL, TRUSTED, GUARDIANS) and their thresholds to Copilot Chat and asked it to: *"Write the CSS for a reputation progress card with a coloured pill badge, a progress bar, and a dot-indicator row for each tier level."*

#### 3. The Output & Verification
The CSS output was mostly usable — it produced the pill shape, the bar track, and a basic dot row. But it used static colour values for all tiers and did not produce the per-tier conditional colour theming. The bar fill percentage calculation was also wrong; it used the raw score as a percentage directly, making the bar overflow past 100% for higher reputation scores.

#### 4. Human Refinement
I wrote the full `updateReputationUI()` function myself, computing the correct fill percentage by normalising the score against the active tier's min–max range. I also manually coded the five tier theme classes (`rep-caution`, `rep-novice`, `rep-helpful`, `rep-trusted`, `rep-guardian`) and the panel background gradient transitions in `home.css`, since the AI's static approach had no awareness of which tier the user was currently in.

---

### Project Component: Special Message Type Rendering in Chat  
**AI Tool Used:** GitHub Copilot (Inline Autocomplete)  

#### 1. The Intent
Certain system-triggered messages in the chat — such as claim rejection notices, owner confirmations, and resolution announcements — needed to render with a distinct visual style (coloured background, contrasting text) instead of the default blue/white bubble. I defined my own message key prefix system (`/r`, `/c`, `/o`, `/s`, `/p`, `/f`) to tag these messages at the data layer, which I wrote entirely myself. I then needed Copilot to suggest the CSS rules for each message variant.

#### 2. The Interaction (Prompting)
I wrote the class names as comments above empty rule blocks — `.message.special-message-reject`, `.message.special-message-cancel`, `.message.special-message-ownerconfirm`, etc. — and let Copilot autocomplete the colour values inside each block.

#### 3. The Output & Verification
Copilot predicted reasonable background and border colours for most variants. However, it applied the same blue-on-blue colour to both `sent` and `received` variants of `.special-message-openchat`, making the text unreadable when the poster's own sent message was rendered in that style. It also missed the `sent` override selectors entirely for several types.

#### 4. Human Refinement
I manually wrote the `.message.sent.special-message-*` override selectors for every type where the sent-bubble background needed to match the received-bubble colour, ensuring visual consistency regardless of who triggered the system action. I also adjusted the amber palette for `openchat` and the purple palette for `confirmresolution` to pass contrast checks.

---

### Project Component: Claim Request Notification Cards & Approve Flow  
**AI Tool Used:** GitHub Copilot Chat  

#### 1. The Intent
The Claim Requests section on the dashboard needed to present each incoming claim as a notification-style card, distinguishing PENDING requests with an animated pulse dot and a highlighted warm yellow background, while CHATTING and resolved claims used a quieter neutral style. I loaded all claim request data myself from the server using my own `USER_CLAIM_REQ` endpoint, passing the structured result array into the rendering function. I asked Copilot to generate the card HTML and the pulsing dot animation CSS.

#### 2. The Interaction (Prompting)
I handed Copilot my claim object fields (`claimer.username`, `item.title`, `claim_status`, `answer_text`) and prompted: *"Generate a notification card component with a pulsing dot indicator on the left for pending items, a claimer name row, item title, and the claimer's answer text. Pending cards should have a yellow highlighted background."*

#### 3. The Output & Verification
The generated card HTML was structurally correct and the CSS keyframe for the pulse animation rendered as intended. However, Copilot wired the card's click handler to immediately approve the claim and open chat in a single step with no confirmation gate, which would have allowed accidental approvals with no way to review the claimer's answer first.

#### 4. Human Refinement
I modified the UI and interaction model myself. I removed the approval confirmation modal (`approveConfirmModal`) entirely because the chat interface already has an approval button. I updated the event listener so that clicking any claim request directly calls `openChat()` regardless of its status. I also refactored the card's CSS to use a cleaner `.claim-row` design similar to active claims, dropping the `claim-noti-card` approach Copilot provided, and added status tab filters (All, Pending, Closed) to the container.

---

### Project Component: Reputation Point System — Actions & Score Updates  
**AI Tool Used:** GitHub Copilot (Inline Autocomplete)  

#### 1. The Intent
I needed to wire reputation point changes into the existing action functions across `user_utils.js` so that specific claim lifecycle events — resolve, reject, cancel, abandon, report-and-remove — each adjust the relevant user's score by the agreed amount. The backend `UPDATE_REPUTATION` endpoint in `user_call.php` was already built and tested by me. I wanted Copilot to complete the repetitive `updateReputation(user_id, delta)` call pattern inside each action function.

#### 2. The Interaction (Prompting)
I wrote the function signature and the first `updateReputation` call inside `rejectClaim()` myself as a reference pattern, then allowed Copilot autocomplete to predict the equivalent calls in `cancelClaim()`, `confirmResolution()`, and `abandonItem()`.

#### 3. The Output & Verification
Copilot correctly predicted the call structure in most cases. In `confirmResolution()` it produced both the poster `+10` and claimer `+5` calls in the right order. However, in `abandonItem()` it placed the reputation deduction call after the loop that marks all related claims as ABANDONED and sends cancellation messages, meaning a server error mid-loop would still deduct reputation even if the abandon process failed partway through.

#### 4. Human Refinement
I reordered the `abandonItem()` execution sequence myself so that the reputation deduction (`-7`) happens immediately after the item status update succeeds, before entering the claim cancellation loop. This ensures the deduction only fires when the abandon action has actually committed to the database, and any loop failure returns `false` without double-penalising the user.

---

### Project Component: Index Landing Page — Hero & Scale Stats  
**AI Tool Used:** GitHub Copilot Chat  

#### 1. The Intent
I wanted the public landing page (`index.php`) to show live aggregate statistics — total items posted, total users, and messages sent — pulled from the database and injected into the hero card on page load. I wrote the server-side PHP query myself to aggregate those counts and expose them through an existing endpoint. I then asked Copilot to generate the hero card HTML structure with the three stat blocks and the user panel that conditionally shows a chat shortcut when the visitor is already signed in.

#### 2. The Interaction (Prompting)
I described the layout to Copilot Chat: *"Write a hero card with a top row containing a subtitle, heading, and a 'Live' status badge. Below that, a paragraph of description. Then a 3-column stat grid with IDs itemPosted, totalUsers, and messageSent. Finally a hidden user panel div containing a welcome message and an open-chat button with an unread badge."*

#### 3. The Output & Verification
The generated HTML matched the structural intent well and slotted into the existing dark gradient CSS theme. The main issue was that Copilot unconditionally rendered the user panel as visible, ignoring the session-conditional display logic I had already implemented in the JS load function.

#### 4. Human Refinement
I set `style="display:none;"` on the user panel myself and wired its visibility into the `onIndexLoad()` function, which checks the session data after load and then reveals the panel and populates the username. I also replaced the AI-generated inline style values on the stat cards with my own CSS custom property references to keep the design consistent with the rest of the site's token system.

---

### Project Component: Index Landing Page — About Us Section & Browse Date Labels  
**AI Tool Used:** GitHub Copilot (Inline Autocomplete)  

#### 1. The Intent
I needed to add a 4-card 'About Us' informational section at the bottom of the landing page, and add 'From' and 'To' labels to the date filtering inputs on the `browse.php` page to make the interface clearer for users.

#### 2. The Interaction (Prompting)
In `index.php`, I placed a comment `<!-- About Us Section -->` and let Copilot autocomplete the section wrapper. In `browse.php`, I highlighted the `<input type="date">` elements and asked Copilot to wrap them in divs with descriptive labels.

#### 3. The Output & Verification
Copilot successfully built the 4-card layout for the About Us grid, and wrapped the date inputs perfectly. However, the date labels lacked any styling, causing them to sit uncomfortably next to the inputs, and the About Us section didn't inherit the main content padding.

#### 4. Human Refinement
I added the `date-field` and `date-label` CSS classes in `browse.css` myself to stack the labels vertically and give them an uppercase accent color. I also adjusted the `.about-us-section` CSS in `index.css` to add the proper `padding: 100px 5%` and defined the responsive grid breaking points (`@media` queries) to ensure the cards collapsed gracefully on tablet and mobile viewports.