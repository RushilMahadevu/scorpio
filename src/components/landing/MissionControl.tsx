import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function MissionControl() {
  return (
    <div id="mission-control" className="flex flex-col pt-0 md:pt-10">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center justify-center mb-0 md:mb-10">
             <Link href="/signup" className="mb-4">
                <Badge className="h-8 px-4 rounded-full flex items-center justify-center gap-2 border-primary/20 bg-primary/10 hover:bg-primary/20 backdrop-blur-md" variant="secondary">
                   <Sparkles className="h-3.5 w-3.5 text-primary fill-primary" />
                   <span className="text-primary font-medium">Faculty Command Center</span>
                </Badge>
              </Link>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-center text-foreground pb-4 leading-tight">
              Your Faculty <br />
              <span className="text-5xl md:text-7xl lg:text-[6rem] font-bold mt-1 leading-none text-foreground">
                Mission Control.
              </span>
            </h1>
          </div>
        }
      >
        <Image
          src="/mission-control.png"
          alt="Scorpio Teacher Dashboard showing assignments and student progress"
          height={1280}
          width={2650}
          className="mx-auto rounded-2xl object-contain h-full w-full bg-zinc-900"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
