import { useEffect, useState } from 'react';

import { Header } from '../../components/Header';
import { api } from '../../services/api';
import { Food } from '../../components/Food';
import { ModalAddFood } from '../../components/ModalAddFood';
import { ModalEditFood } from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface IFood {
  id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  image: string;
}

export function Dashboard() {
  const [foods, setFoods] = useState<IFood[]>([]);
  const [editingFood, setEditingFood] = useState<IFood>({} as IFood);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const res = await api.get('/foods');
      console.log(res.data);
      setFoods(res.data);
    }
    loadFoods();
  }, []);

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  async function handleAddFood(
    food: Omit<IFood, 'id' | 'available'>
  ): Promise<void> {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setFoods([...foods, response.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(food: IFood): Promise<void> {
    try {
      const response = await api.put(`/foods/${editingFood.id}`, {
        ...food,
        id: editingFood.id,
        available: editingFood.available,
      });

      const foodIndex = foods.findIndex((f) => f.id === editingFood.id);

      const newFoods = [...foods];
      newFoods[foodIndex] = response.data;

      setFoods(newFoods);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`);
    setFoods(foods.filter((food) => Number(food.id) !== id));
  }

  function handleEditFood(food: IFood): void {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  async function handleUpdateAvailable(food: IFood): Promise<void> {
    await api.put(`/foods/${food.id}`, food).then((response) => {
      const updatedFoods = foods.map((foodToBeFound) => {
        if (foodToBeFound.id === food.id) {
          Object.assign(foodToBeFound, response.data);
        }
        return foodToBeFound;
      });

      setFoods(updatedFoods);
    });
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map((food) => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleUpdateAvailable={handleUpdateAvailable}
            />
          ))}
      </FoodsContainer>
    </>
  );
}
