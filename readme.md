# SwiftFound — User Manual

SwiftFound is a campus lost and found web platform built to help students and staff quickly reconnect lost items with their owners through a structured, chat-based claim workflow and a reputation system that rewards trustworthy behavior.

## Core Features
1. **Post Lost & Found Items:** Quickly upload images and details of items you've found or lost.
2. **Browse & Filter Feed:** Search items by category, location, and date with real-time dynamic filtering.
3. **Structured Claim System:** Answer security questions when claiming items to prove ownership.
4. **Live Chat Verification:** Direct real-time messaging between poster and claimer to confirm details.
5. **Reputation Tiers:** Earn points for resolving claims honestly, lose points for canceling or being reported.

---

## User Workflows

### 1. Dashboard Overview
Upon logging in, you are greeted by your **Member Dashboard**.
![Dashboard Overview](/img/placeholder_dashboard.png)
- **Quick Stats:** View counts of your posted items, active claims, pending requests, and resolved items.
- **Reputation Card:** Check your current standing (e.g., NOVICE, HELPFUL) and see how many points you need for the next tier.
- **Restricted Status:** If an admin restricts your account due to poor behavior, a red banner will appear here explaining the restrictions.

### 2. Posting an Item
![Post Item Form](/img/placeholder_post.png)
1. Click **Post Item** from the dashboard or sidebar.
2. Fill out the title, category, location, and description.
3. Provide a **Security Question** (e.g., "What color is the case?") that claimers must answer.
4. Upload an image of the item.

### 3. Browsing and Filtering
![Browse Feed](/img/placeholder_browse.png)
- Use the **Browse Items** page to look through the campus feed.
- **Filters:** Use the sidebar to filter by Keyword, Category, Location, and Date ranges (From/To).
- Use the **Show also** checkboxes to include Resolved or Claimed items in your search results.

### 4. Claiming an Item
![Claim Item Modal](/img/placeholder_claim.png)
1. Click on any **Available** item in the browse feed.
2. Click the **Claim Item** button.
3. A modal will ask you the poster's security question. Type your answer and submit.
4. The item will now appear in your **My Active Claims** tab on the dashboard, and the poster will receive a **Claim Request**.

### 5. Managing Claim Requests
![Claim Requests](/img/placeholder_requests.png)
If someone claims an item you posted, it appears in your **Claim Requests** tab.
- **Pending** requests are highlighted in yellow with a pulsing dot.
- Click a request to open the live chat with the claimer.

### 6. The Live Chat Workflow
![Chat Interface](/img/placeholder_chat.png)
The chat system is where items are verified and handoffs are arranged.
- **Posters** can see the claimer's answer to the security question as the first message.
- If the answer is correct, the poster can click **Confirm Owner** to lock in the claim and reject all other claimers.
- Once the physical item is returned, the poster clicks **Item Returned**, marking the claim as **Resolved**.
- If the answer is wrong, the poster can click **Reject Claim**.
- **Claimers** can cancel their claim at any time if they realize the item isn't theirs.

### 7. The Reputation System
SwiftFound relies on trust. Your actions directly affect your reputation score:
- **Resolve an item:** Poster (+10), Claimer (+5)
- **Cancel a claim:** (-1) penalty to the claimer
- **Reject a claim:** (-3) penalty to the claimer for false claims
- **Abandon an item:** (-7) penalty to the poster for failing to manage their post
- **Reported & Removed:** (-15) penalty if your item violates community guidelines

**Tiers:**
- **CAUTION** (< 0 points)
- **NOVICE** (0 - 19 points)
- **HELPFUL** (20 - 49 points)
- **TRUSTED** (50 - 99 points)
- **GUARDIANS** (100+ points)
