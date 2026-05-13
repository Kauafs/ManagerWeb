import AppButton from "../../../styles/button";
import AppMainContainer from "../../../styles/main";

export default function UsersPage(){
    return (
        <AppMainContainer title="Usuários">
            <div className="flex justify-between items-center">
                <h1 className="font-bold text-[20px]">Lista de usuários</h1>

                <AppButton name='Novo usuário' form="round" type="outline"  />
            </div>
        </AppMainContainer>
    )
}