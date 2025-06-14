import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks/use-users';

import { processRawModels, processRawModel } from '@/lib/transformers';
import api from '@/lib/axios';

export const useFetchModels = (query = '') => {
  const { data: me } = useMe();

  const resolvedQuery = query.replaceAll('<me>', me?.id || '');

  return useQuery({
    enabled: !!me,
    queryKey: ['models', resolvedQuery],
    queryFn: async () => {
      const { data: modelsRaw } = await api.get<ModelRaw[]>(`models?${resolvedQuery}`);
      const models = processRawModels(modelsRaw, { selfId: me!.id });
      models.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return models;
    },
    staleTime: 1000 * 60 * 5,
  });
};
export const useFetchDefaultModels = () => useFetchModels('visibility=default');
export const useFetchSubscribedModels = () => useFetchModels('subscriberId=<me>');
export const useFetchPrivateModels = () => useFetchModels('creatorId=<me>');
export const useFetchPublicModels = () => useFetchModels('visibility=public');

export const useUpdateModelById = (modelId: string) => {
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async (payload: Partial<ModelData>) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: updatedModelRaw } = await api.patch<ModelRaw>(`models/${modelId}`, payload);
      const updatedModel = processRawModel(updatedModelRaw, { selfId: me.id });

      return updatedModel;
    },

    onSuccess: (updatedModel) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      queryClient.setQueryData(
        ['model', modelId],
        () => updatedModel,
      );
      queryClient.setQueryData(
        ['models', `creatorId=${me.id}`],
        (oldCache?: Model[]) => {
          const old: Model[] = oldCache || [];
          const newModels = [...old];

          const at = newModels.findIndex(model => model.id === updatedModel.id);
          if (at !== -1) {
            newModels.splice(at, 1);
          }
          newModels.unshift(updatedModel);

          return newModels;
        },
      );
    },
  });
};

export const useCreateModel = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async (payload: Required<ModelData>) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: newModelRaw } = await api.post<ModelRaw>('models', payload);
      const newModel = processRawModel(newModelRaw, { selfId: me.id });

      return newModel;
    },

    onSuccess: (deletedModel) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      queryClient.setQueryData(
        ['models', `creatorId=${me.id}`],
        (oldCache?: Model[]) => {
          const old: Model[] = oldCache || [];
          const newModels = [deletedModel, ...old];

          return newModels;
        },
      );

      router.push(deletedModel.url);
    },
  });
};

export const useDeleteModelById = (modelId: string) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async () => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: deletedModelRaw } = await api.delete<ModelRaw>(`models/${modelId}`);
      const deletedModel = processRawModel(deletedModelRaw, { selfId: me.id });

      return deletedModel;
    },

    onSuccess: (deletedModel) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      queryClient.setQueryData(
        ['models', `creatorId=${me.id}`],
        (oldCache?: Model[]) => {
          const old: Model[] = oldCache || [];
          const newModels = [...old];

          const at = newModels.findIndex(m => m.id === deletedModel.id);
          if (at !== -1) {
            newModels.splice(at, 1);
          }

          return newModels;
        },
      );

      router.push('/');
    },
  });
};

export const useFetchModelById = (modelId: string) => {
  const { data: me } = useMe();

  return useQuery({
    enabled: !!me,
    queryKey: ['model', modelId],
    queryFn: async () => {
      const { data: modelRaw } = await api.get<ModelRaw>(`models/${modelId}`);
      const model = processRawModel(modelRaw, { selfId: me!.id });

      return model;
    },
    staleTime: 1000 * 60,
  });
};

export const useToggleModelSubscriptionById = (modelId: string) => {
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  return useMutation({
    mutationFn: async (subscribe: boolean) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: updatedModelRaw } = subscribe
        ? await api.post<ModelRaw>(`models/${modelId}/subscribers/self`)
        : await api.delete<ModelRaw>(`models/${modelId}/subscribers/self`);
      const updatedModel = processRawModel(updatedModelRaw, { selfId: me.id });

      return updatedModel;
    },
    onSuccess: (updatedModel) => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      queryClient.setQueryData(
        ['model', modelId],
        () => updatedModel,
      );
      queryClient.setQueryData(
        ['models', `subscriberId=${me.id}`],
        (oldCache?: Model[]) => {
          const old: Model[] = oldCache ?? [];
          const newModels = [...old];

          const at = newModels.findIndex(model => model.id === updatedModel.id);
          if (at !== -1) {
            newModels[at] = updatedModel;
          }
          else {
            newModels.unshift(updatedModel);
          }

          return newModels;
        },
      );
    },
  });
};
