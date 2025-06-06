import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks/use-users';

import { ModelRaw, Model, processRawModels, ModelData, processRawModel, ModelCache } from '@/types/model.types';

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

      const list = processRawModels(modelsRaw, { selfId: me.id });
      const registry = new Map<string, Model>();

      list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      for (const model of list) {
        registry.set(model.id, model);
      }

      return {
        list,
        registry,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateModel = (modelId: string) => {
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

    onSuccess: (data) => {
      queryClient.setQueryData(
        ['models'],
        (oldCache?: ModelCache) => {
          const old: ModelCache = oldCache || {
            list: [],
            registry: new Map(),
          };

          const newList = [...old.list];
          const newRegistry = new Map(old.registry);

          const at = newList.findIndex(model => model.id === data.id);
          if (at !== -1) {
            newList.splice(at, 1);
          }
          newList.unshift(data);
          newRegistry.set(data.id, data);

          return {
            list: newList,
            registry: newRegistry,
          };
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
        (oldCache?: ModelCache) => {
          const old: ModelCache = oldCache || {
            list: [],
            registry: new Map(),
          };

          const newList = [data, ...old.list];
          const newRegistry = new Map(old.registry);

          newRegistry.set(data.id, data);

          return {
            list: newList,
            registry: newRegistry,
          };
        },
      );

      router.push(data.url);
    },
  });
};
