import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { content } = await request.json();
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Check if user is part of the project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        teamLead: true,
        teamMembers: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const isTeamMember = project.teamLeadId === user.id || 
      project.teamMembers.some(member => member.id === user.id);

    if (!isTeamMember) {
      return NextResponse.json(
        { error: "You are not a member of this project" },
        { status: 403 }
      );
    }

    // Create the note
    const note = await prisma.$transaction(async (tx) => {
      // Ensure user exists in the database
      const dbUser = await tx.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          name: user.email?.split('@')[0] || 'User',
          role: 'engineer'
        }
      });

      return tx.note.create({
        data: {
          content,
          projectId,
          userId: dbUser.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json(
      { error: "Failed to add note" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { noteId, content } = await request.json();
    if (!noteId || !content) {
      return NextResponse.json(
        { error: "Note ID and content are required" },
        { status: 400 }
      );
    }

    // Update the note using a transaction
    const updatedNote = await prisma.$transaction(async (tx) => {
      // Check if note exists and belongs to the user
      const existingNote = await tx.note.findUnique({
        where: { id: noteId },
        include: {
          project: true,
        },
      });

      if (!existingNote) {
        throw new Error("Note not found");
      }

      if (existingNote.userId !== user.id) {
        throw new Error("You can only edit your own notes");
      }

      // Update the note
      return tx.note.update({
        where: { id: noteId },
        data: { content },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating note:", error);
    if (error instanceof Error) {
      if (error.message === "Note not found") {
        return NextResponse.json(
          { error: "Note not found" },
          { status: 404 }
        );
      }
      if (error.message === "You can only edit your own notes") {
        return NextResponse.json(
          { error: "You can only edit your own notes" },
          { status: 403 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { noteId } = await request.json();
    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    // Delete the note using a transaction
    await prisma.$transaction(async (tx) => {
      // Check if note exists and belongs to the user
      const existingNote = await tx.note.findUnique({
        where: { id: noteId },
      });

      if (!existingNote) {
        throw new Error("Note not found");
      }

      if (existingNote.userId !== user.id) {
        throw new Error("You can only delete your own notes");
      }

      // Delete the note
      await tx.note.delete({
        where: { id: noteId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    if (error instanceof Error) {
      if (error.message === "Note not found") {
        return NextResponse.json(
          { error: "Note not found" },
          { status: 404 }
        );
      }
      if (error.message === "You can only delete your own notes") {
        return NextResponse.json(
          { error: "You can only delete your own notes" },
          { status: 403 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
} 