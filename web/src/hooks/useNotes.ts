import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { Note, TiptapContent } from '../types';

export const useNotes = (folderId?: string) => {
  const queryClient = useQueryClient();

  // Get notes by folder
  const {
    data: notes = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notes', folderId],
    queryFn: () => folderId ? api.getNotesByFolder(folderId) : Promise.resolve([]),
    enabled: !!folderId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get single note
  const useNote = (noteId?: string) => {
    return useQuery({
      queryKey: ['note', noteId],
      queryFn: () => noteId ? api.getNote(noteId) : Promise.resolve(null),
      enabled: !!noteId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: false, // 获取单个笔记不需要重试
      throwOnError: false,
    });
  };

  // Create note
  const createNoteMutation = useMutation({
    mutationFn: ({ folderId, title, content }: { folderId: string; title: string; content?: TiptapContent }) =>
      api.createNote(folderId, title, content),
    onSuccess: (newNote: Note) => {
      queryClient.setQueryData(['notes', newNote.folderId], (old: Note[] = []) => [
        ...old,
        newNote
      ]);
    },
  });

  // Update note
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, title, content }: { id: string; title: string; content: TiptapContent }) =>
      api.updateNote(id, title, content),
    onSuccess: (updatedNote: Note) => {
      // Update note in notes list
      queryClient.setQueryData(['notes', updatedNote.folderId], (old: Note[] = []) =>
        old.map(note => note._id === updatedNote._id ? updatedNote : note)
      );
      // Update individual note cache
      queryClient.setQueryData(['note', updatedNote._id], updatedNote);
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['notes', updatedNote.folderId] });
    },
  });

  // Delete note
  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onSuccess: (_, deletedId) => {
      // Remove from all notes lists
      queryClient.setQueriesData({ queryKey: ['notes'] }, (old: Note[] = []) =>
        old.filter(note => note._id !== deletedId)
      );
      // Remove individual note cache
      queryClient.removeQueries({ queryKey: ['note', deletedId] });
    },
  });

  // Move note
  const moveNoteMutation = useMutation({
    mutationFn: ({ id, targetFolderId }: { id: string; targetFolderId: string }) =>
      api.moveNote(id, targetFolderId),
    onSuccess: (movedNote: Note, { id, targetFolderId }) => {
      // Remove from old folder
      queryClient.setQueriesData({ queryKey: ['notes'] }, (old: Note[] = []) =>
        old.filter(note => note._id !== id)
      );
      // Add to new folder
      queryClient.setQueryData(['notes', targetFolderId], (old: Note[] = []) => [
        ...old,
        movedNote
      ]);
      // Update individual note cache
      queryClient.setQueryData(['note', movedNote._id], movedNote);
    },
  });


  return {
    notes,
    isLoading,
    error,
    refetch,
    useNote,
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    moveNote: moveNoteMutation.mutate,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
    isMoving: moveNoteMutation.isPending,
  };
};