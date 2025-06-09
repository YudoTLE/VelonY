import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks/use-users';

import { processRawModels, processRawModel } from '@/lib/transformers';
import api from '@/lib/axios';

export const useFetchModels = () => {
  const { data: me } = useMe();

  return useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: modelsRaw } = await api.get<ModelRaw[]>('models');
      const models = processRawModels(modelsRaw, { selfId: me.id });
      models.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return models;
    },
    staleTime: 1000 * 60 * 5,
  });
};

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
      queryClient.setQueryData(
        ['model', modelId],
        () => updatedModel,
      );
      queryClient.setQueryData(
        ['models'],
        (oldCache?: Model[]) => {
          const old: Model[] = oldCache || [];
          const newModels = [...old];

          const at = newModels.findIndex(model => model.id === updatedModel.id);
          if (at !== -1) {
            newModels[at] = updatedModel;
          }

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

    onSuccess: (data) => {
      queryClient.setQueryData(
        ['models'],
        (oldCache?: Model[]) => {
          const old: Model[] = oldCache || [];
          const newModels = [data, ...old];

          return newModels;
        },
      );

      router.push(data.url);
    },
  });
};

export const useFetchModelById = (modelId: string) => {
  const { data: me } = useMe();

  return useQuery({
    queryKey: ['model', modelId],
    queryFn: async () => {
      if (!me) {
        throw new Error('Unauthenticated');
      }

      const { data: modelRaw } = await api.get<ModelRaw>(`models/${modelId}`);
      const model = processRawModel(modelRaw, { selfId: me.id });

      console.log('MODEL KONTOL', model);

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
      queryClient.setQueryData(
        ['model', modelId],
        () => updatedModel,
      );
      queryClient.setQueryData(
        ['models'],
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
