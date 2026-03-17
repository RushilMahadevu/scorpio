"use client";

import { Bot, NotebookPen, Edit3, Waypoints, PackageOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useWindowSize } from "@/hooks/use-window-size";
import { useState } from "react";

const items = [
  {
    id: 1,
    title: "Research-Grade Tutor",
    Icon: Bot,
    imgSrc: "/ai-tutor.png",
    description: "A centralized tutoring system for students to access all 4 layers of the architecture, with seamless transitions and personalized guidance.",
  },
  {
    id: 2,
    title: "Socratic Notebook",
    Icon: NotebookPen,
    imgSrc: "/network-previews/notebook.png",
    description: "An interactive workspace where students engage with the 4-layer scaffolding architecture to master physics concepts.",
  },
  {
    id: 3,
    title: "Practice Engine",
    Icon: Edit3,
    imgSrc: "/network-previews/practice.png",
    description: "Dynamic problem sets that adapt to student performance, ensuring the optimal level of challenge.",
  },
  {
    id: 4,
    title: "Equation Vault",
    Icon: PackageOpen,
    imgSrc: "/equation-vault.png",
    description: "Detailed breakdown of class-wide and individual student performance, highlighting specific learning gaps.",
  },
    {
    id: 5,
    title: "Waypoints",
    Icon: Waypoints,
    imgSrc: "/waypoints.png",
    description: "Detailed breakdown of class-wide and individual student performance, highlighting specific learning gaps.",
  },
];

const panelVariants = {
  open: {
    width: "100%",
    height: "100%",
  },
  closed: {
    width: "0%",
    height: "100%",
  },
};

const panelVariantsSm = {
  open: {
    width: "100%",
    height: "300px",
  },
  closed: {
    width: "100%",
    height: "0px",
  },
};

const descriptionVariants = {
  open: {
    opacity: 1,
    y: "0%",
    transition: {
      delay: 0.125,
    },
  },
  closed: { opacity: 0, y: "100%" },
};

const Panel = ({ open, setOpen, id, Icon, title, imgSrc, description }: any) => {
  const { width } = useWindowSize();
  const isOpen = open === id;

  return (
    <>
      <button
        className="bg-card hover:bg-muted/50 cursor-pointer transition-colors p-4 border-r border-b border-border/50 flex flex-row-reverse lg:flex-col justify-end items-center gap-4 relative group"
        onClick={() => setOpen(id)}
      >
        <span
          style={{
            writingMode: "vertical-lr",
          }}
          className="hidden lg:block text-sm font-bold tracking-widest uppercase rotate-180 text-muted-foreground group-hover:text-foreground transition-colors"
        >
          {title}
        </span>
        <span className="block lg:hidden text-sm font-bold tracking-widest uppercase text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </span>
        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary/10 text-primary rounded-lg grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon size={18} />
        </div>
        <span className="w-3 h-3 bg-card group-hover:bg-muted/50 transition-colors border-r border-b lg:border-b-0 lg:border-t border-border/50 rotate-45 absolute bottom-0 lg:bottom-[50%] right-[50%] lg:right-0 translate-y-[50%] translate-x-[50%] z-20" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={`panel-${id}`}
            variants={width && width > 1024 ? panelVariants : panelVariantsSm}
            initial="closed"
            animate="open"
            exit="closed"
            style={{
              backgroundImage: `url(${imgSrc})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
            className="w-full h-full overflow-hidden relative bg-zinc-950 flex items-end border-b lg:border-b-0 lg:border-r border-border/50"
          >
            <motion.div
              variants={descriptionVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="w-full px-6 py-4 bg-background/60 backdrop-blur-md border-t border-border/50 text-foreground"
            >
              <p className="text-sm font-semibold">{description}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const SystemAccordion = () => {
  const [open, setOpen] = useState(items[0].id);

  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl overflow-hidden border border-border/60 bg-card shadow-2xl mt-12">
      <div className="flex flex-col lg:flex-row h-fit lg:h-[500px] w-full items-stretch">
        {items.map((item) => {
          return (
            <Panel
              key={item.id}
              open={open}
              setOpen={setOpen}
              id={item.id}
              Icon={item.Icon}
              title={item.title}
              imgSrc={item.imgSrc}
              description={item.description}
            />
          );
        })}
      </div>
    </div>
  );
};
