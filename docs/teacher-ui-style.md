# Teacher portal UI style

Design around what the teacher came to do. Keep the grading queue near the top, put filters next to the results they control, and give the roster or assignment list room to breathe.

- **Start with a quiet header.** Use the shared `TeacherPageHeader` for a clear title, one short sentence when it helps, and the page’s main action.
- **Use blue for the next important action.** The default `Button` gives Create, Invite, and Save a blue background and white text. Use outline or ghost for Preview, Export, and row actions. Keep destructive actions in a menu with confirmation.
- **Group related information.** Use one strip for counts, one surface for a list, and thin dividers between rows. Put related details together, such as a student’s name and email.
- **Show extra controls when needed.** Keep charts, advanced settings, and add forms behind a clear disclosure or dialog. Give loading and empty states plain language and a next step when there is one.
- **Check the layout at phone width.** Let actions and filters wrap, label icon-only controls, and keep save buttons clear of the floating Support button. Use theme tokens so the same layout works in light and dark mode.
