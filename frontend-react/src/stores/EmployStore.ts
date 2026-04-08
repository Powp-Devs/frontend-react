import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import { Funcionario } from "../types/Employer";

const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
    baseURL: apiUrl,
});

class EmployeeStore {
    employees: Funcionario[] = [];
    loading: boolean = false;
    totalItems: number = 0;
    currentPage: number = 1;

    constructor() {
        makeAutoObservable(this);
        // Atualiza totalItems com base nos dados mockados
        this.totalItems = this.employees.length;
    }

    // método de conveniência para compatibilidade com componentes existentes
    loadClients(page = 1) {
        return this.fetchEmployees(page);
    }

    // mobx getter para expor loading como isLoading
    get isLoading() {
        return this.loading;
    }

    // Action para carregar clientes (página ou busca futura)
    fetchEmployees = async (page = 1) => {
        this.loading = true;
        try {
            const response = await api.get(`/funcionarios?page=${page}`);
            runInAction(() => {
                this.employees = response.data.data;
                this.totalItems = response.data.total;
                this.currentPage = page;
                this.loading = false;
            });
        } catch (error) {
            runInAction(() => {
                this.loading = false;
                console.error("Erro ao buscar funcionários:", error);
            });
        }
    };

    // Action para excluir cliente
    deleteEmployee = async (id: number) => {
        try {
            await api.delete(`/funcionarios/${id}`);
            await this.fetchEmployees(this.currentPage);
        } catch (error) {
            console.error("Erro ao excluir funcionário:", error);
        }
    };

    // Action para adicionar/atualizar cliente
    saveEmployee = async (client: Partial<Funcionario>) => {
        try {
            if (client.id) {
                await api.put(`/funcionarios/${client.id}`, client);
            } else {
                await api.post(`/funcionarios`, client);
            }
            await this.fetchEmployees(this.currentPage);
        } catch (error) {
            console.error("Erro ao salvar funcionário:", error);
            throw error;
        }
    };
}

export const employeeStore = new EmployeeStore();
