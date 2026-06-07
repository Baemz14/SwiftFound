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

#### 4. Human Refinement
I completely rewrote the internal logical evaluation gates of its filtering array from a strict boolean check to an inclusive flag system. This allowed users to combine search strings and overlapping filter checkboxes cleanly, while ensuring my own data array safely drove the interface drawing cycle.