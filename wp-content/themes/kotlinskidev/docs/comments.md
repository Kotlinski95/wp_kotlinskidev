# Comments / Notes

1. Check the outline gradient button type, to not force the gradient background on hover - we have such option inside out hover effects, to set the gradient background there.
2. Make sure the gradient outline button height will be same as other button with same paddings, currently looks like the gradient border is created without actual border width, so another button places near the gradient one has different height visually, even with same border/paddings/text and font size, etc.
3. Copy field near the protected phone/ protected email, once click on icon user should bet the copied email/phone to his stack. (copy icon to be added)
4. Cookie policy generated text (on this page: <http://kotlinskidev.local/en/cookies-policy/>) - how to change color from foreground-alt to normal foreground adaptive. Color changes on block itself doesn’t affect live website (but I don’t have normal color/background there, only text-gradient color selector.
5. Accessibility toggle floating icon - adjust UI to the cookies icon, to be consistent, with size and position according to other menu’s On all resolutions
6. Articles page contains both PL and EN articles onboth PL/EN versions (recommendations on this page: <http://kotlinskidev.local/en/articles/>), it’s incosistent, PL articles should include only polish articles, same for EN.
7. Adjust primary color for dark/light mode, to different one currently we have one primary, and I want to keep same consistent flow as other colors like surface/foreground. Current primary will be the one ‘adaptive’. Support for primary color adaptive, same as foreground adaptive, to set different for dark/light mode.(Support for each selected pallete in theme.json).
8. Clean appearance → customize →
   - Enable Image Lightbox option, which is I belive out of the box now, right? Let’s think if it’s used anywhere.
