import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { Folder } from '../types';

export const useFolders = () => {
  const queryClient = useQueryClient();

  const {
    data: folders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['folders'],
    queryFn: () => api.getFolders(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createFolderMutation = useMutation({
    mutationFn: (name: string) => api.createFolder(name),
    onSuccess: (newFolder: Folder) => {
      queryClient.setQueryData(['folders'], (old: Folder[] = []) => [
        ...old,
        newFolder
      ]);
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      api.updateFolder(id, name),
    onSuccess: (updatedFolder: Folder) => {
      queryClient.setQueryData(['folders'], (old: Folder[] = []) =>
        old.map(folder => 
          folder._id === updatedFolder._id ? updatedFolder : folder
        )
      );
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => api.deleteFolder(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['folders'], (old: Folder[] = []) =>
        old.filter(folder => folder._id !== deletedId)
      );
      // Invalidate related notes queries
      queryClient.invalidateQueries({ 
        queryKey: ['notes', deletedId] 
      });
    },
  });

  return {
    folders,
    isLoading,
    error,
    refetch,
    createFolder: createFolderMutation.mutate,
    updateFolder: updateFolderMutation.mutate,
    deleteFolder: deleteFolderMutation.mutate,
    isCreating: createFolderMutation.isPending,
    isUpdating: updateFolderMutation.isPending,
    isDeleting: deleteFolderMutation.isPending,
  };
};