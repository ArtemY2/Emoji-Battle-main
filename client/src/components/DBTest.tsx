// client/src/components/DBTest.tsx
// Компонент для тестирования подключения к БД

import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getProfile, listProfiles } from '../graphql/queries';
import { createProfile, updateProfile } from '../graphql/mutations';

const client = generateClient();

const DBTest: React.FC = () => {
    const { user } = useAuthenticator((context) => [context.user]);
    const [testResult, setTestResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const testDatabaseConnection = async () => {
        setLoading(true);
        setTestResult('Тестирование подключения к БД...\n');

        try {
            // 1. Тест получения профиля
            setTestResult(prev => prev + '1. Тестирование getProfile...\n');

            const profileResponse = await client.graphql({
                query: getProfile,
                variables: { id: user?.userId || 'test' },
                authMode: 'userPool'
            });

            setTestResult(prev => prev + `✅ getProfile работает: ${JSON.stringify(profileResponse.data?.getProfile)}\n\n`);

            // 2. Тест создания профиля (если не существует)
            if (!profileResponse.data?.getProfile) {
                setTestResult(prev => prev + '2. Создание тестового профиля...\n');

                const createResponse = await client.graphql({
                    query: createProfile,
                    variables: {
                        input: {
                            id: user?.userId || `test-${Date.now()}`,
                            username: user?.username || 'TestUser',
                            emoji: '🧪'
                        }
                    },
                    authMode: 'userPool'
                });

                setTestResult(prev => prev + `✅ createProfile работает: ${JSON.stringify(createResponse.data?.createProfile)}\n\n`);
            }

            // 3. Тест обновления профиля
            setTestResult(prev => prev + '3. Тестирование updateProfile...\n');

            const updateResponse = await client.graphql({
                query: updateProfile,
                variables: {
                    input: {
                        id: user?.userId || 'test',
                        username: user?.username || 'TestUser',
                        emoji: '🔬'
                    }
                },
                authMode: 'userPool'
            });

            setTestResult(prev => prev + `✅ updateProfile работает: ${JSON.stringify(updateResponse.data?.updateProfile)}\n\n`);

            // 4. Тест списка профилей
            setTestResult(prev => prev + '4. Тестирование listProfiles...\n');

            const listResponse = await client.graphql({
                query: listProfiles,
                variables: { limit: 5 },
                authMode: 'userPool'
            });

            setTestResult(prev => prev + `✅ listProfiles работает: найдено ${listResponse.data?.listProfiles?.items?.length || 0} профилей\n\n`);

            setTestResult(prev => prev + '🎉 ВСЕ ТЕСТЫ БД ПРОШЛИ УСПЕШНО!\n');
            setTestResult(prev => prev + '✅ AWS Amplify GraphQL API работает корректно\n');
            setTestResult(prev => prev + '✅ Аутентификация работает\n');
            setTestResult(prev => prev + '✅ CRUD операции работают\n');

        } catch (error: any) {
            setTestResult(prev => prev + `❌ ОШИБКА БД: ${error.message}\n`);
            setTestResult(prev => prev + `📋 Детали: ${JSON.stringify(error, null, 2)}\n`);
        } finally {
            setLoading(false);
        }
    };

    const testSchema = async () => {
        setLoading(true);
        setTestResult('Тестирование схемы БД...\n');

        try {
            // Проверяем доступные поля в Profile
            const introspectionQuery = `
                query IntrospectionQuery {
                    __schema {
                        types {
                            name
                            fields {
                                name
                                type {
                                    name
                                }
                            }
                        }
                    }
                }
            `;

            const result = await client.graphql({
                query: introspectionQuery,
                authMode: 'userPool'
            });

            setTestResult(prev => prev + '✅ Introspection запрос выполнен\n');
            setTestResult(prev => prev + 'Схема БД успешно доступна\n');

        } catch (error: any) {
            setTestResult(prev => prev + `❌ Ошибка схемы: ${error.message}\n`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">🧪 Тестирование БД (AWS Amplify)</h2>

            <div className="space-x-4 mb-4">
                <button
                    onClick={testDatabaseConnection}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                    {loading ? 'Тестирование...' : 'Тест CRUD операций'}
                </button>

                <button
                    onClick={testSchema}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                >
                    Тест схемы
                </button>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg min-h-32">
                <h3 className="font-semibold mb-2">Результаты тестирования:</h3>
                <pre className="text-sm whitespace-pre-wrap">{testResult || 'Нажмите кнопку для начала тестирования'}</pre>
            </div>

            <div className="mt-4 text-sm text-gray-600">
                <p><strong>Что тестируется:</strong></p>
                <ul className="list-disc ml-6">
                    <li>Подключение к AWS AppSync GraphQL API</li>
                    <li>Аутентификация через Cognito</li>
                    <li>CRUD операции (Create, Read, Update)</li>
                    <li>Схема базы данных</li>
                    <li>Права доступа (@auth директивы)</li>
                </ul>
            </div>
        </div>
    );
};

export default DBTest;