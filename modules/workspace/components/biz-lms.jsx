"use client";
import { GraduationCap, PlayCircle, Clock, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@shared/components/rifah/app-shell";
import { Panel } from "@shared/components/rifah/ui-bits";
import { Button } from "@shared/components/ui/button";
import { useCourses } from "@shared/hooks/use-rifah-api";
import { Progress } from "@shared/components/ui/progress";

export function BizLms() {
  const { data: coursesData, isLoading } = useCourses();
  const courses = Array.isArray(coursesData?.data) ? coursesData.data : (Array.isArray(coursesData) ? coursesData : []);

  return (
    <AppShell role="business" title="Learning Center" subtitle="Access training materials and courses provided by RIFAH">
      <div className="space-y-6">
        <Panel title="Available Courses">
          {isLoading ? (
            <div className="flex justify-center p-8 text-muted-foreground">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border-t">
              <div className="bg-muted p-4 rounded-full mb-4">
                <GraduationCap className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No Courses Available</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                There are currently no training materials or courses assigned to your business. Check back later.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const chapters = course.chapters || [];
                let totalContents = (course.contents?.length || 0);
                chapters.forEach(ch => {
                  totalContents += (ch.contents?.length || 0);
                });

                return (
                  <div key={course._id} className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-xs hover:border-primary/50 hover:shadow-md transition-all">
                    <div className="p-5 flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {course.scope === 'centre' || course.visibilityScope === 'centre' ? 'Central Training' : 'Regional Training'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg line-clamp-1 mb-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {course.description || "No description provided."}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                        {chapters.length > 0 && (
                          <span className="inline-flex items-center gap-1 font-medium text-foreground">
                            {chapters.length} Chapters
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <PlayCircle className="h-4 w-4" />
                          <span>{totalContents} Lessons</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 pt-0 mt-auto">
                      <Button asChild className="w-full">
                        <Link href={`/biz/lms/${course._id}`}>
                          View Course <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
