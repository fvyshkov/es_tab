import time, os
from django.test import LiveServerTestCase
from django.test import SimpleTestCase
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import random

TEST = "1.Бюджет Годовой"

MAX_WAIT = 10

def wait_for_success_proc(proc, proc_params=None, run_on_except=None):
    start_time = time.time()
    success = False
    while not success:
        try:
            proc(proc_params)
            success = True
            print("!!!")
        except:
            print("wait for proc success")
            if time.time() - start_time > MAX_WAIT:
                raise
            if run_on_except:
                run_on_except()
            time.sleep(.1)


def scroll_shim(passed_in_driver, object):
    x = object.location['x']
    y = object.location['y']
    scroll_by_coord = 'window.scrollTo(%s,%s);' % (
        x,
        y
    )
    scroll_nav_out_of_way = 'window.scrollBy(0, -120);'
    passed_in_driver.execute_script(scroll_by_coord)
    passed_in_driver.execute_script(scroll_nav_out_of_way)

"""
запуск одного теста -  
python manage.py test functional_tests.tests.NewVisitorTest.test_open_table_sheet_add_records

"""

class NewVisitorTest(SimpleTestCase):

    def setUp(self):
        self.browser = webdriver.Firefox()
        self.live_server_url = 'http://127.0.0.1:8000/'
        self.browser.get(self.live_server_url)
        self.cleanup_layout()

    def tearDown(self):
        self.browser.quit()

    def cleanup_layout(self):
        self.wait_for_layouts_loaded()
        close = WebDriverWait(self.browser, MAX_WAIT).until(
            EC.element_to_be_clickable((By.ID, "close_all_layout_items")))
        close.click()

    def test_open_table_sheet_add_records(self):
        print("test_open_table_sheet_add_records")
        """
        Самый первый "настоящий" тест
        Открываем виджет
        Выбираем лист path=["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
        Устанавливаем значения аналитик
        Если есть записи - удаляем их одну за другой
        Добавляем 10 записей, вводим при этом тестовые знгачения для поля "арендатор"
        Проверяем, что в статус-баре отобразилось именно 10 записей
        """

        path=["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
        filters = {"Плоскость планирования": "План","ЦФО и инвестиции": "ГО"}
        sheet_layout = self.prepare_table_sheet(path, filters)

        row_count=10

        for i in range(0,row_count):
            print("i", i)
            sheet_layout.sheet_insert()
            sheet_layout.update_cell(i, "Арендодатель", "ООО тест "+str(i+1))

        self.assertEqual(sheet_layout.row_count(), row_count)

    def _test_row(self):
        for i in range(1,10):
            self.test_detail()

            #path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]

            self.browser.quit()
            self.browser = webdriver.Firefox()
            self.live_server_url = 'http://127.0.0.1:8000/'
            self.browser.get(self.live_server_url)

    def test_create_and_open_desktop(self):
        """
        создаем и открываем десктоп ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
        без фильтров
        """
        sheet_layout = self.prepare_table_sheet(["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"], {})
        sheet_layout.sheet_insert()
        sheet_layout.wait_for_loaded()
        desktop_name =  "TEST Аренда, одна пустая запись"
        self.save_desktop(desktop_name)
        close = WebDriverWait(self.browser, MAX_WAIT).until(EC.element_to_be_clickable((By.ID, "close_all_layout_items")))
        close.click()

        open = WebDriverWait(self.browser, MAX_WAIT).until(EC.element_to_be_clickable((By.ID, "open_desktop")))

        open.click()

        desktop_row_xpath = "//td[@role='gridcell' and text()='{}']".format(desktop_name)
        desktop_row = WebDriverWait(self.browser, MAX_WAIT).until(EC.element_to_be_clickable((By.XPATH, desktop_row_xpath)))
        desktop_row.click()

        select_button_xpath = "//span[@class='dx-button-text' and text()='Выбрать']"
        select_button = WebDriverWait(self.browser, MAX_WAIT).until(EC.element_to_be_clickable((By.XPATH, select_button_xpath)))
        select_button.click()
        time.sleep(1)

        sheet_layout = Layout(self.browser, "TableViewWithSelection")
        sheet_layout.wait_for_loaded()

        return sheet_layout

    def open_desktop(self, desktop_name):
        open = WebDriverWait(self.browser, MAX_WAIT).until(EC.element_to_be_clickable((By.ID, "open_desktop")))
        open.click()

        desktop_row_xpath = "//td[@role='gridcell' and text()='{}']".format(desktop_name)
        desktop_row = WebDriverWait(self.browser, MAX_WAIT).until(
            EC.element_to_be_clickable((By.XPATH, desktop_row_xpath)))
        desktop_row.click()

        select_button_xpath = "//span[@class='dx-button-text' and text()='Выбрать']"
        select_button = WebDriverWait(self.browser, MAX_WAIT).until(
            EC.element_to_be_clickable((By.XPATH, select_button_xpath)))
        select_button.click()
        time.sleep(1)



    def wait_for_layouts_loaded(self):
        layout_is_loaded_path = "//div[@class='Wrapper' and @isloading='0']"
        WebDriverWait(self.browser, MAX_WAIT).until(EC.presence_of_element_located((By.XPATH, layout_is_loaded_path)))


    def test_sheet_after_desktop(self):
        """
        после загрузки десктопа
        ЗАНОВО открываем лист (в этом примере тот же, хотя лучше будет сделать пример с другим)
        и выполняем проверки из другого теста - удаление, добавление, работа формул
        """

        sheet_layout = self.test_create_and_open_desktop()
        sheet_layout.open_sheet(["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"])
        sheet_layout.delete_all()

        sheet_layout.sheet_insert()
        sheet_layout.wait_for_loaded()
        sheet_layout.update_cell(0, "Арендодатель", "ООО тест 1")
        sheet_layout.update_cell(0, "Класс", "Класс А")
        sheet_layout.update_cell(0, "Площадь, кв.м.", "1")

        sheet_layout.sheet_insert()
        sheet_layout.wait_for_loaded()
        sheet_layout.update_cell(1, "Арендодатель", "ООО тест 2")
        sheet_layout.update_cell(1, "Класс", "Класс Б")
        sheet_layout.update_cell(1, "Площадь, кв.м.", "1")

        sheet_layout.sheet_insert()
        sheet_layout.wait_for_loaded()
        sheet_layout.update_cell(2, "Арендодатель", "ООО тест 3")
        sheet_layout.update_cell(2, "Класс", "Класс С")
        sheet_layout.update_cell(2, "Площадь, кв.м.", "1")

        cell1 = sheet_layout.find_cell(0, "Ежемесячные расходы")

        # пока не умеем зажав шифт ткнуть в  произвольную клетку (из-за необходимости перейти в начало грида для поиска клетки)
        # поэтому такое неаккуратное выделение области стрелками
        ActionChains(self.browser).click(cell1).perform()
        ActionChains(self.browser).key_down(Keys.SHIFT).perform()
        ActionChains(self.browser).send_keys(Keys.ARROW_DOWN).perform()
        ActionChains(self.browser).send_keys(Keys.ARROW_DOWN).perform()
        ActionChains(self.browser).key_up(Keys.SHIFT).perform()

        self.assertEqual(float(sheet_layout.status_bar_value("Сумма")), 850)

    def select_area(self, cell, area_width, area_height):
        ActionChains(self.browser).click(cell).perform()
        ActionChains(self.browser).key_down(Keys.SHIFT).perform()

        for i in range(1, area_width):
            ActionChains(self.browser).send_keys(Keys.ARROW_RIGHT).perform()

        for i in range(1, area_height):
            ActionChains(self.browser).send_keys(Keys.ARROW_DOWN).perform()

        ActionChains(self.browser).key_up(Keys.SHIFT).perform()

    def test_colors_after_desktop(self):
        """
        проверяем работу с цветами (на уже открытом виджете) после загрузки десктопа
        """
        sheet_layout = self.test_create_and_open_desktop()


        colors = {
            "Запрет редактирования": [random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)],
            "Ручной ввод": [random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)],
            "Аналитики": [random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)]
        }

        sheet_layout.update_colors(colors)

        sheet_layout.refresh_sheet()

        cell = sheet_layout.find_cell(0, "Стоимость, год")
        color_text = cell.value_of_css_property("background-color")
        color_rgb = color_text[color_text.find("(") + 1:color_text.find(")")].split(',')
        del color_rgb[-1]
        color_rgb = [int(x) for x in color_rgb]
        # print("Запрет редактирования", color_rgb)

        self.assertEqual(colors["Запрет редактирования"], color_rgb)

        cell = sheet_layout.find_cell(0, "Плоскость планирования")
        color_text = cell.value_of_css_property("background-color")
        color_rgb = color_text[color_text.find("(") + 1:color_text.find(")")].split(',')
        del color_rgb[-1]
        color_rgb = [int(x) for x in color_rgb]
        # print("Аналитики", color_rgb)

        self.assertEqual(colors["Аналитики"], color_rgb)

        cell = sheet_layout.find_cell(0, "Класс")
        color_text = cell.value_of_css_property("background-color")
        color_rgb = color_text[color_text.find("(") + 1:color_text.find(")")].split(',')
        del color_rgb[-1]
        color_rgb = [int(x) for x in color_rgb]
        # print("Ручной ввод", color_rgb)

        self.assertEqual(colors["Ручной ввод"], color_rgb)

    def test_colors(self):
        """
        открываем, создаем одну запись, переопределяем цвета, проверяем как раскрашивается
        """
        try:
            path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
            filters =  {}#{"Плоскость планирования": "План", "ЦФО и инвестиции": "ГО"}

            sheet_layout = self.prepare_table_sheet(path, filters)

            sheet_layout.sheet_insert()
            sheet_layout.wait_for_loaded()

            colors = {
                        "Запрет редактирования": [random.randint(0, 255) for x in [1,2,3]],
                        "Аналитики": [random.randint(0, 255) for x in [1, 2, 3]],
                        "Ручной ввод": [random.randint(0, 255) for x in [1,2,3]],

                    }
            """

            colors = {
                "Запрет редактирования": [1, 2, 3],
                "Ручной ввод": [1, 2, 3],
                "Аналитики": [1, 2, 3],
            }
            """
            sheet_layout.update_colors(colors)


            sheet_layout.refresh_sheet()

            cell = sheet_layout.find_cell(0, "Стоимость, год")
            color_text = cell.value_of_css_property("background-color")
            color_rgb = color_text[color_text.find("(") + 1:color_text.find(")")].split(',')
            del color_rgb[-1]
            color_rgb = [int(x) for x in color_rgb]
            #print("Запрет редактирования", color_rgb)

            self.assertEqual(colors["Запрет редактирования"], color_rgb)


            cell = sheet_layout.find_cell(0, "Плоскость планирования")
            color_text = cell.value_of_css_property("background-color")
            color_rgb = color_text[color_text.find("(") + 1:color_text.find(")")].split(',')
            del color_rgb[-1]
            color_rgb = [int(x) for x in color_rgb]
            #print("Аналитики", color_rgb)

            self.assertEqual(colors["Аналитики"], color_rgb)

            cell = sheet_layout.find_cell(0, "Класс")
            color_text = cell.value_of_css_property("background-color")
            color_rgb = color_text[color_text.find("(") + 1:color_text.find(")")].split(',')
            del color_rgb[-1]
            color_rgb = [int(x) for x in color_rgb]
            #print("Ручной ввод", color_rgb)

            self.assertEqual(colors["Ручной ввод"], color_rgb)

        except:
            self.browser.quit()
            raise


    def test_multi_sheet(self):
        print("test_multi_sheet")
        """
        Тестирование самих инструментов тестирования
        открываем два листа ЗК, чистим, создаем записи в них, проверяем количество
        """
        try:
            path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
            filters = {"ЦФО и инвестиции": "ГО"}
            sheet_layout1 = self.prepare_table_sheet(path, filters)

            path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
            filters = {"Плоскость планирования": "План", "ЦФО и инвестиции": "ГО"}

            sheet_layout2 = self.prepare_table_sheet(path, filters)

            sheet_layout1.sheet_insert()
            sheet_layout1.wait_for_loaded()

            sheet_layout2.sheet_insert()
            sheet_layout2.wait_for_loaded()

            sheet_layout1.sheet_insert()
            sheet_layout1.wait_for_loaded()

            sheet_layout2.sheet_insert()
            sheet_layout2.wait_for_loaded()

            sheet_layout1.sheet_insert()
            sheet_layout1.wait_for_loaded()

            sheet_layout2.sheet_insert()
            sheet_layout2.wait_for_loaded()

            sheet_layout1.sheet_insert()
            sheet_layout1.wait_for_loaded()

            #time.sleep(1)
            self.assertEqual(sheet_layout1.row_count(), 4)
            self.assertEqual(sheet_layout2.row_count(), 3)
        except:
            self.browser.quit()
            raise

    def test_table_chart(self):
        print("test_table_diagram")
        """
        Открываем виджет
        Выбираем лист path=["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
        Устанавливаем значения аналитик
        Если есть записи - удаляем их одну за другой

        Вводим 3 записи, получаем такие значения
        класс, площадь  цена        стоимость   ежемесячно
        Класс А	1.00	4 300.00	4 300.00	358.33
        Класс Б	1.00	3 900.00	3 900.00	325.00
        Класс С	1.00	2 000.00	2 000.00	166.67

        - Открываем два графика, по разным областям
        - Проверяем цифры на обоих
        
        """
        try:
            """
            path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
            filters = {"Плоскость планирования": "План", "ЦФО и инвестиции": "ГО"}
            sheet_layout = self.prepare_table_sheet(path, filters)

            sheet_layout.sheet_insert()
            sheet_layout.wait_for_loaded()
            sheet_layout.update_cell(0, "Арендодатель", "ООО тест 1")
            sheet_layout.update_cell(0, "Класс", "Класс А")
            sheet_layout.update_cell(0, "Площадь, кв.м.", "1")

            sheet_layout.sheet_insert()
            sheet_layout.wait_for_loaded()
            sheet_layout.update_cell(1, "Арендодатель", "ООО тест 2")
            sheet_layout.update_cell(1, "Класс", "Класс Б")
            sheet_layout.update_cell(1, "Площадь, кв.м.", "1")

            sheet_layout.sheet_insert()
            sheet_layout.wait_for_loaded()
            sheet_layout.update_cell(2, "Арендодатель", "ООО тест 3")
            sheet_layout.update_cell(2, "Класс", "Класс С")
            sheet_layout.update_cell(2, "Площадь, кв.м.", "1")
            """
            self.open_desktop("Аренда")
            time.sleep(1)
            sheet_layout = Layout(self.browser, "TableViewWithSelection")
            sheet_layout.wait_for_loaded()
            cell1 = sheet_layout.find_cell(0, "Класс")

            self.select_area(cell1, 2, 3)
            self.run_context_menu(cell1, ["Chart Range", "Pie", "Doughnut"])

            #ресайзим график чтобы был вдвое меньше листа по измерениям
            chart = chart_resize_handle = self.browser.find_elements_by_xpath("//div[contains(@class,'LayoutItem')]")[-1]
            chart_resize_handle = self.browser.find_elements_by_xpath("//div[contains(@class,'LayoutItem')]//span[contains(@class,'react-resizable-handle')]")[-1]
            xoffset = -(chart.size.get('width') - sheet_layout.layout.size.get('width')/2)
            yoffset = -(chart.size.get('height') - sheet_layout.layout.size.get('height')/2)
            ActionChains(self.browser).drag_and_drop_by_offset(chart_resize_handle,  xoffset, yoffset ).perform()

            cell1 = sheet_layout.find_cell(0, "Класс")
            self.select_area(cell1, 2, 2)
            self.run_context_menu(cell1, ["Chart Range", "Column", "Grouped"])

            # ресайзим график чтобы был вдвое меньше листа по измерениям
            chart = chart_resize_handle = self.browser.find_elements_by_xpath("//div[contains(@class,'LayoutItem')]")[
                -1]
            chart_resize_handle = self.browser.find_elements_by_xpath(
                "//div[contains(@class,'LayoutItem')]//span[contains(@class,'react-resizable-handle')]")[-1]
            xoffset = -(chart.size.get('width') - sheet_layout.layout.size.get('width') / 2)
            yoffset = -(chart.size.get('height') - sheet_layout.layout.size.get('height') / 2)
            ActionChains(self.browser).drag_and_drop_by_offset(chart_resize_handle, xoffset, yoffset).perform()

            #<div class="ag-chart-tooltip-content">Класс Б: 40</div>

            time.sleep(3)

        except:
            self.browser.quit()
            raise

    def run_context_menu(self, cell, menu_path):

        ActionChains(self.browser).context_click(cell).perform()

        ActionChains(self.browser).send_keys(Keys.ARROW_DOWN).perform()


        def get_menu_item(item_text):
            print("look for", item_text)
            menu_path = "//div[contains(@class,'ag-menu-option-active')]//span[contains(@class,'ag-menu-option-text') and contains(text(),'{}')]".format(
                item_text)
            self.browser.find_element_by_xpath(menu_path)

        def run_on_except():
            ActionChains(self.browser).send_keys(Keys.ARROW_DOWN).perform()

        for menu_item in menu_path:
            wait_for_success_proc(get_menu_item, menu_item, run_on_except)
            if menu_item==menu_path[-1]:
                ActionChains(self.browser).send_keys(Keys.ENTER).perform()
            else:
                ActionChains(self.browser).send_keys(Keys.ARROW_RIGHT).perform()


    def test_open_table_sheet_recalc(self):
        print("test_open_table_sheet_recalc")
        """
        Открываем виджет
        Выбираем лист path=["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
        Устанавливаем значения аналитик
        Если есть записи - удаляем их одну за другой

        Вводим 3 записи, получаем такие значения
        класс, площадь  цена        стоимость   ежемесячно
        Класс А	1.00	4 300.00	4 300.00	358.33
        Класс Б	1.00	3 900.00	3 900.00	325.00
        Класс С	1.00	2 000.00	2 000.00	166.67

        Пока проверяем только сумму по "ежемесячно"!
        """
        try:
            path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
            filters = {"Плоскость планирования": "План", "ЦФО и инвестиции": "ГО"}
            sheet_layout = self.prepare_table_sheet(path, filters)

            sheet_layout.sheet_insert()
            sheet_layout.wait_for_loaded()
            sheet_layout.update_cell(0, "Арендодатель", "ООО тест 1")
            sheet_layout.update_cell(0, "Класс", "Класс А")
            sheet_layout.update_cell(0, "Площадь, кв.м.", "1")


            sheet_layout.sheet_insert()
            sheet_layout.wait_for_loaded()
            sheet_layout.update_cell(1, "Арендодатель", "ООО тест 2")
            sheet_layout.update_cell(1, "Класс", "Класс Б")
            sheet_layout.update_cell(1, "Площадь, кв.м.", "1")

            sheet_layout.sheet_insert()
            sheet_layout.wait_for_loaded()
            sheet_layout.update_cell(2, "Арендодатель", "ООО тест 3")
            sheet_layout.update_cell(2, "Класс", "Класс С")
            sheet_layout.update_cell(2, "Площадь, кв.м.", "1")



            cell1 = sheet_layout.find_cell(0, "Ежемесячные расходы")

            self.select_area(cell1, 1,3)

            def assert_sum():
                self.assertEqual(float(sheet_layout.status_bar_value("Сумма")), 850)

            wait_for_success_proc(assert_sum)


        except:
            self.browser.quit()
            raise

    def test_detail(self):
        print("test_detail")
        """
        Детализация

        Открываем лист path=["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
        Устанавливаем значения аналитик
        Если есть записи - удаляем их одну за другой

        Вводим 2 записи, открываем детализацию для записи №1, вводим суммы, проверяем сумму наверху
        Проверяем сумму (нулевую) и на второй записи, для которой не вводили детали

        Проверяем работу формулу в детализации
        """
        try:
            path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
            filters = {"ЦФО и инвестиции": "ГО"}
            sheet_layout = self.prepare_table_sheet(path, filters)

            sheet_layout.sheet_insert()
            sheet_layout.update_cell(0, "Номер", "100500")

            cell = sheet_layout.find_cell(0, "Сумма")
            ActionChains(self.browser).context_click(cell).perform()
            menu_dtl_path = "//span[contains(@class,'ag-menu-option-text') and contains(text(),'етализация')]"
            self.wait_for_element_by_xpath(menu_dtl_path)
            self.browser.find_element_by_xpath(menu_dtl_path).click()

            detail_layout = Layout(self.browser, "TableViewDetail")

            sheet_layout.sheet_insert()
            sheet_layout.update_cell(1, "Номер", "100501")
            sheet_layout.wait_for_loaded()

            detail_layout.sheet_insert()
            detail_layout.update_cell(0, "Наименование", "Деталь 1")
            detail_layout.update_cell(0, "Сумма детали", "1")
            detail_layout.wait_for_loaded()
            sheet_layout.wait_for_loaded()

            detail_layout.sheet_insert()
            detail_layout.update_cell(1, "Наименование", "Деталь 2")
            detail_layout.update_cell(1, "Сумма детали", "2")
            detail_layout.wait_for_loaded()
            sheet_layout.wait_for_loaded()

            detail_layout.sheet_insert()
            detail_layout.update_cell(2, "Наименование", "Деталь 3")
            detail_layout.update_cell(2, "Сумма детали", "3")
            detail_layout.wait_for_loaded()
            sheet_layout.wait_for_loaded()

            #проверки
            #1. сумма по записи 1 = 6
            def vrf1():
                sum_cell = sheet_layout.find_cell(0, "Сумма")
                sum_text = sum_cell.find_element_by_xpath(".//div[@class='cell-wrapper']/div").text
                self.assertEqual(float(sum_text), 6)
            wait_for_success_proc(vrf1)

            #2. сумма по записи 2 = 0
            def vrf2():
                sum_cell = sheet_layout.find_cell(1, "Сумма")
                sum_text = sum_cell.find_element_by_xpath(".//div[@class='cell-wrapper']/div").text
                self.assertEqual(float(sum_text), 0)
            wait_for_success_proc(vrf2)

            #3. формула по детализации
            def vrf3():
                cell = detail_layout.find_cell(2, "Сумма формула")
                text = cell.find_element_by_xpath(".//div[@class='cell-wrapper']/div").text
                self.assertEqual(text, "сумма*2=6.00")
            wait_for_success_proc(vrf3)

            print("test_detail FIN")

        except:
            self.browser.quit()
            raise

    def test_detail_context_menu(self):
        print("test_detail_context_menu")
        """
        Детализация

        Открываем лист path=["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
        Устанавливаем значения аналитик
        Если есть записи - удаляем их одну за другой

        Вводим 1 записи, проверяем отсутствие контекстного меню "детализация" на клетке ручного ввода
        """
        try:
            path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
            filters = {"ЦФО и инвестиции": "ГО"}
            sheet_layout = self.prepare_table_sheet(path, filters)

            sheet_layout.sheet_insert()
            sheet_layout.update_cell(0, "Номер", "100500")



            #проверки
            #нет "детализации" в контекстном меню
            cell = sheet_layout.find_cell(0, "Описание")
            ActionChains(self.browser).context_click(cell).perform()
            menu_dtl_path = "//span[@class='ag-menu-option-text' and contains(text(),'етализация')]"
            try:
                self.wait_for_element_by_xpath(menu_dtl_path)
                raise NameError('Опция "детализация" на клетке без детализации')
            except (AssertionError, WebDriverException) as e:
                pass


        except:
            self.browser.quit()
            raise


    def test_expression(self):
        print("test_expression")
        """
        Открываем лист path=["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
        Устанавливаем значения аналитик
        Если есть записи - удаляем их одну за другой

        Вводим запись, проверяем работу формулы
        """
        try:
            path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Детализация"]
            filters = {"ЦФО и инвестиции": "ГО"}
            sheet_layout = self.prepare_table_sheet(path, filters)

            sheet_layout.sheet_insert()
            sheet_layout.update_cell(0, "Номер", "100500")
            sheet_layout.update_cell(0, "Описание", "Работа формулы")

            sheet_layout.wait_for_loaded()

            #проверки
            def my_assert():
                sum_cell = sheet_layout.find_cell(0, "Формула")
                sum_text = sum_cell.find_element_by_xpath(".//div[@class='cell-wrapper']/div").text
                self.assertTrue('Запись №100500 описание = "Работа формулы", коррекция' in sum_text)
                print("that's it!")

            wait_for_success_proc(my_assert)
        except:
            self.browser.quit()
            raise

    def test_save_desktop(self):
        print("test_save_desktop")
        """
        пока не тест, а заготовка - открываем лист, сохранячем десктоп, удаляем десктоп
        """
        path = ["TEST TEST", "2017", "1.0", "Заявочные бюджеты", "Аренда"]
        filters = {"Плоскость планирования": "План", "ЦФО и инвестиции": "ГО"}
        self.prepare_table_sheet(path, filters)

        self.save_desktop("TEST_001")
        time.sleep(1)
        self.delete_desktop("TEST_001")

    def save_desktop(self, desktop_name):
        """
        Ищем десктоп с таким же названием,
            если нашли - переписываем,
            иначе создаем новый
        """
        self.open_desktop_replace()
        desktop_row_xpath = "//td[@role='gridcell' and text()='{}']".format(desktop_name)
        try:
            self.browser.find_element_by_xpath(desktop_row_xpath).click()
            select_button_xpath = "//span[@class='dx-button-text' and text()='Выбрать']"
            self.wait_for_element_by_xpath(select_button_xpath)
            select_button = self.browser.find_element_by_xpath(select_button_xpath)
            print("select_button", select_button.text)
            select_button.click()
        except:
            close_button_xpath = "//div[@role='button' and @aria-label='Закрыть']"
            self.wait_for_element_by_xpath(close_button_xpath)
            close_btn = self.browser.find_element_by_xpath(close_button_xpath)
            print("close_btn", close_btn.text)
            #close_btn.click()
            self.browser.execute_script("arguments[0].click();", close_btn)

            self.save_new_desktop(desktop_name)


    def delete_desktop(self, desktop_name):
        self.open_desktop_replace()
        desktop_row_xpath = "//td[@role='gridcell' and text()='{}']".format(desktop_name)
        try:
            self.browser.find_element_by_xpath(desktop_row_xpath).click()
            delete_button_xpath = "//i[contains(@class, 'dx-icon-clear')]/parent::*/parent::*"
            self.wait_for_element_by_xpath(delete_button_xpath)
            delete_button = self.browser.find_element_by_xpath(delete_button_xpath)
            delete_button.click()
        except:
            pass

        close_button_xpath = "//span[@class='dx-button-text' and text()='Закрыть']/parent::*/parent::*"
        self.wait_for_element_by_xpath(close_button_xpath)
        self.browser.find_element_by_xpath(close_button_xpath).click()

    def save_new_desktop(self, desktop_name):
        print("save_new_desktop")
        #self.open_additional_menu()
        button_id = 'save_desktop_new'
        self.wait_for_element_by_id(button_id)
        button = self.browser.find_element_by_id(button_id)
        button.click()

        input_xpath = "//input[@name='LONGNAME']"
        self.wait_for_element_by_xpath(input_xpath)
        self.browser.find_element_by_xpath(input_xpath).send_keys(desktop_name)

        select_button_xpath = "//span[@class='dx-button-text' and text()='OK']"
        self.wait_for_element_by_xpath(select_button_xpath)
        self.browser.find_element_by_xpath(select_button_xpath).click()



    def open_additional_menu(self):
        button_xpath = "//div[@class='dx-button-content']//i[contains(@class, 'dx-icon-overflow')]"
        self.wait_for_element_by_xpath(button_xpath)
        button = self.browser.find_element_by_xpath(button_xpath)
        button.click()

        return
        

    def open_desktop_replace(self):
        #self.open_additional_menu()
        button_id = 'save_desktop_replace'
        self.wait_for_element_by_id(button_id)
        button = self.browser.find_element_by_id(button_id)
        button.click()
        self.wait_for_element_by_xpath("//div[text()='Рабочие столы']")

    def find_layout_by_type(self, layout_item_type):
        xpath = "div[layoutitemtype='{}' and contains(@class, 'LayoutItem')]".format(layout_item_type)
        self.wait_for_element_by_xpath(xpath)
        layout = self.browser.find_element_by_xpath(xpath)
        return layout

    def prepare_table_sheet(self, path, filters):
        """
        Открываем виджет
        Выбираем лист path
        Устанавливаем значения аналитик filters
        Если есть записи - удаляем их одну за другой
        возвращаем Layout для данного виджета
        """
        sheet_layout = self.open_new_sheet(path)
        sheet_layout.setup_sheet_filters(filters)
        sheet_layout.refresh_sheet()
        sheet_layout.delete_all()

        return sheet_layout


    def open_new_sheet(self, path):
        #открыли виджет
        add_sheet_button_id = 'add_layout_sheet_item'
        self.wait_for_element_by_id(add_sheet_button_id)
        add_sheet_button = self.browser.find_element_by_id(add_sheet_button_id)
        add_sheet_button.send_keys(Keys.ENTER)

        sheet_layout = Layout(self.browser, "TableViewWithSelection")
        sheet_layout.open_sheet(path)


        return sheet_layout


    def wait_for_element_by_id(self, element_id):
        start_time = time.time()
        while True:
            try:
                element = self.browser.find_element_by_id(element_id)
                return
            except (AssertionError, WebDriverException) as e:
                if time.time() - start_time > MAX_WAIT:
                    raise e
                time.sleep(0.5)




    def wait_for_element_by_class_name(self, class_name):
        start_time = time.time()
        while True:
            try:
                element = self.browser.find_element_by_class_name(class_name)
                return
            except (AssertionError, WebDriverException) as e:
                if time.time() - start_time > MAX_WAIT:
                    raise e
                time.sleep(0.5)


    def wait_for_element_by_xpath(self, xpath):
        start_time = time.time()
        while True:
            try:
                element = self.browser.find_element_by_xpath(xpath)
                return element
            except (AssertionError, WebDriverException) as e:
                if time.time() - start_time > MAX_WAIT:
                    raise e
                time.sleep(0.5)

class Layout(object):


    def __init__(self, browser, layout_type):
        self.browser = browser
        xpath = "//div[@layoutitemtype='{}' and contains(@class, 'LayoutItem')]".format(layout_type)
        layouts = self.browser.find_elements_by_xpath(xpath)
        if len(layouts)>0:
            self.layout = layouts[-1]
            self.layout_item_id = self.layout.get_attribute("idx")
        else:
            raise NameError('Виджет не наден')


    def wait_for_element_by_xpath(self, xpath):
        start_time = time.time()
        while True:
            try:
                element = self.layout.find_element_by_xpath(xpath)
                return element
            except (AssertionError, WebDriverException) as e:
                if time.time() - start_time > MAX_WAIT:
                    raise e
                time.sleep(0.2)

    def wait_for_element_by_id(self, element_id):
        start_time = time.time()
        while True:
            try:
                element = self.layout.find_element_by_id(element_id)
                return element
            except (AssertionError, WebDriverException) as e:
                if time.time() - start_time > MAX_WAIT:
                    raise e
                time.sleep(0.2)

    def find_cell(self, row_index, column_name):

        # скроллим грид пока не найдем соответствующую колонку
        header_cell_xpath = ".//span[@class='ag-header-cell-text' and text()='{}' and @role='columnheader']".format(column_name)
        column_found = False
        self.focus_on_first_cell()

        while not column_found:
            try:
                span = self.layout.find_element_by_xpath(header_cell_xpath)
                column_found = True
            except:
                ActionChains(self.browser).key_down(Keys.ARROW_RIGHT).perform()
                time.sleep(.1)
                print("looking fo column {}".format(column_name))





        header_cell_xpath = ".//div[contains(@class,'ag-header-cell')]//span[@class='ag-header-cell-text' and text()='{}' and @role='columnheader']//ancestor::div[contains(@class,'ag-header-cell') and (contains(@col-id,'C') or contains(@col-id,'FLT')  )]".format(column_name)
        header_cell = self.wait_for_element_by_xpath(header_cell_xpath)
        cell_xpath = ".//div[contains(@class,'ag-row') and @row-index='{}']//div[contains(@class,'ag-cell') and @col-id='{}']".format(str(row_index), header_cell.get_attribute("col-id"))

        cell = self.wait_for_element_by_xpath(cell_xpath)

        selected = False
        while not selected:
            try:
                cell.click()
                selected = True
            except:
                time.sleep(.1)
                cell = self.wait_for_element_by_xpath(cell_xpath)

        return cell


    def focus_on_first_cell(self):
        first_cell_xpath = ".//div[@class='cell-wrapper']/parent::*"
        cell = self.wait_for_element_by_xpath(first_cell_xpath)
        selected = False
        while not selected:
            try:
                cell.click()
                selected = True
            except:
                print("waiting for first cell")
                time.sleep(.1)

                cell = self.wait_for_element_by_xpath(first_cell_xpath)

        for i in range(0,20):
            ActionChains(self.browser).key_down(Keys.ARROW_LEFT).perform()


    def update_cell(self, row_index, column_name, cell_value):
        cell = self.find_cell(row_index, column_name)
        cell_is_refer = self.cell_is_refer(cell)
        cell = self.find_cell(row_index, column_name)

        if cell_is_refer:
            cell.send_keys(Keys.ENTER)
            selected_item_xpath=".//div[contains(@class,'dx-item')]//span[text()='{}']".format(cell_value)
            item = self.wait_for_element_by_xpath(selected_item_xpath)
            item.click()
        else:
            cell.send_keys(cell_value)
            cell.send_keys(Keys.ENTER)

    def cell_is_refer(self, cell):
        try:
            if cell.find_element_by_xpath(".//div[@class='text-cell' and @refer='1']"):
                return True
        except:
            return False


    def wait_for_loaded(self, is_loaded="1"):
        #time.sleep(.1)
        is_loaded_xpath = ".//div[contains(@class, 'LayoutItem') and @idx='{}']//div[@class='isLoaded' and @isloaded='{}']".format(
            self.layout_item_id, is_loaded)
        WebDriverWait(self.browser, MAX_WAIT).until(EC.presence_of_element_located((By.XPATH, is_loaded_xpath)))


    def setup_sheet_filters(self, filters):
        print("Устанавливаем аналитики", filters)
        self.open_sheet_flt_panel()

        for filter in filters:
            #здесь еще нужно будет добавить очистку фильтра, если что-то уже указано
            print(filter, '=', filters[filter])
            #вводим текст для поиска значения аналитики (чтобы не искать по иерархии)
            flt_search_xpath = ".//div[text()='{}']/parent::*//input[@class='search']".format(
                filter)
            flt_search = self.wait_for_element_by_xpath(flt_search_xpath)
            flt_search.click()
            flt_search.send_keys(filters[filter])
            #и наконец кликаем нужное
            flt_value_xpath = ".//label[@title='{}']//input[@class='checkbox-item']".format(filters[filter])
            flt_value = self.wait_for_element_by_xpath(flt_value_xpath)#WebDriverWait(self.browser, MAX_WAIT).until(EC.element_to_be_clickable((By.XPATH, flt_value_xpath)))
            flt_value.click()

    def refresh_sheet(self):
        refresh_xpath = ".//div[@aria-label='refresh']"
        refresh = self.wait_for_element_by_xpath(refresh_xpath)
        refresh.click()
        self.wait_for_loaded()

    def sheet_flt_panel_is_opened(self):
        panel = self.wait_for_element_by_xpath(".//div[@class='filterPanel']")
        return panel.is_displayed()

    def open_sheet_flt_panel(self):
        panel_is_opened =  self.sheet_flt_panel_is_opened()
        print("panel_is_opened", panel_is_opened)
        if not panel_is_opened:
            btn_xpath = ".//button[span[text()='Аналитики']]"
            btn = self.wait_for_element_by_xpath(btn_xpath)
            btn.click()

    def refresh_sheet(self):
        #refresh_xpath = ".//div[@aria-label='refresh']"
        #refresh = self.wait_for_element_by_xpath(refresh_xpath)

        refresh = WebDriverWait(self.browser, MAX_WAIT).until(
            EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'LayoutItem') and @idx='{}']//div[@aria-label='refresh']".format(self.layout_item_id))))
        #refresh.click()
        self.browser.execute_script("arguments[0].click();", refresh)
        self.wait_for_loaded()

    def row_count(self):
        return int(self.status_bar_value("Строк"))

    def status_bar_value(self, name):
        self.wait_for_loaded()
        xpath = ".//div[contains(@class,'ag-status-bar')]\
                                    //span[@ref='eLabel' and text()='{}']\
                                    /parent::*/span[@ref='eValue']".format(name)
        return self.wait_for_element_by_xpath(xpath).text

    def sheet_delete_first(self):
        self.wait_for_loaded()

        def no_loading_cells():
            cells_loading_xpath = ".//div[contains(@class, 'ag-row')]//div[contains(@class, 'ag-cell')]//div[@class='spinner']"
            if self.layout.find_elements_by_xpath(cells_loading_xpath):
                raise NameError("is loading")

        time.sleep(.5)
        wait_for_success_proc(no_loading_cells)

        cells_xpath = ".//div[contains(@class, 'ag-row')]//div[contains(@class, 'ag-cell')]"
        cells = self.layout.find_elements_by_xpath(cells_xpath)

        if len(cells) > 0:

            selected = False

            start_time = time.time()

            while not selected:
                try:
                    cells[0].click()
                    selected = True
                except (AssertionError, WebDriverException) as e:
                    if time.time() - start_time > MAX_WAIT:
                        raise e
                    time.sleep(.1)
                    cells = self.layout.find_elements_by_xpath(cells_xpath)
                    print("wait for cell")

            row_count = self.row_count()

            sheet_delete = self.layout.find_element_by_id("view_delete")
            sheet_delete.click()
            confirm_xpath = "//div[contains(@class, 'dx-button') and @aria-label='Yes']"
            element = WebDriverWait(self.browser, MAX_WAIT).until(EC.element_to_be_clickable((By.XPATH, confirm_xpath)))
            element.click()

            def my_assert():
                if self.row_count() != row_count-1:
                    raise NameError("Delete failed")

            wait_for_success_proc(my_assert)

            return 1

        return 0

    def sheet_insert(self):
        row_count = self.row_count()
        ins_xpath = "//div[contains(@class, 'LayoutItem') and @idx='{}']//div[@id='view_insert']".format(self.layout_item_id)
        element = WebDriverWait(self.browser, MAX_WAIT).until(EC.element_to_be_clickable((By.XPATH, ins_xpath)))
        element.click()
        start_time = time.time()
        while self.row_count()==row_count:
            time.sleep(.1)
            if time.time() - start_time > MAX_WAIT:
                raise NameError("Insert failed")


    def sheet_colors(self):
        btn_xpath = "//div[contains(@class, 'LayoutItem') and @idx='{}']//div[@id='view_color']".format(self.layout_item_id)
        element = WebDriverWait(self.browser, MAX_WAIT).until(EC.element_to_be_clickable((By.XPATH, btn_xpath)))
        element.click()



    def open_sheet_list_node(self, node_label):
        node_img_xpath = "//div[contains(@class, 'dx-treeview') and @layoutitemid='{}']//li[@aria-label='{}' and @role='treeitem']//div[contains(@class,'dx-treeview-toggle-item-visibility')]".format(
            self.layout_item_id,  node_label)
        node_img = WebDriverWait(self.browser, MAX_WAIT).until(EC.presence_of_element_located((By.XPATH, node_img_xpath)))

        if 'firefox' in self.browser.capabilities['browserName']:
            print("firefox")
            success = False
            while not success:
                try:
                    print("try")
                    ActionChains(self.browser).move_to_element(node_img).perform()
                    success = True
                except:
                    print("except")
                    time.sleep(.1)
                    ActionChains(self.browser).send_keys(Keys.ARROW_DOWN).perform()
            """
            while not WebDriverWait(self.browser, MAX_WAIT).until(EC.visibility_of_element_located((By.XPATH, node_img_xpath))):
                print("about to click down")
                time.sleep(.1)

                ActionChains(self.browser).send_keys(Keys.ARROW_DOWN).perform()
                time.sleep(1)
            """
            #scroll_shim(self.browser, node_img)
            #self.browser.execute_script("arguments[0].scrollIntoView();", node_img)
            #time.sleep(.5)
            #pass

        ActionChains(self.browser).move_to_element(node_img).perform()
        #after scroll can be stale, so renew -
        node_img = WebDriverWait(self.browser, MAX_WAIT).until(EC.element_to_be_clickable((By.XPATH, node_img_xpath)))
        node_img.click()
        
    def update_colors(self, colors):

        self.sheet_colors()

        for color in colors:
            color_btn_xpath = "//div[@class='dx-field-label' and text()='{}']/parent::*//input[@type='text']".format(
                color)
            color_btn = WebDriverWait(self.browser, MAX_WAIT).until(
                EC.element_to_be_clickable((By.XPATH, color_btn_xpath)))
            ActionChains(self.browser).move_to_element(color_btn).perform()
            color_btn.click()
            for i in range(0,7):
                color_btn.send_keys(Keys.BACKSPACE)

            new_color_hex = '#%02x%02x%02x' % (colors[color][0], colors[color][1], colors[color][2])
            color_btn.send_keys(new_color_hex)
            color_btn.send_keys(Keys.TAB)


        WebDriverWait(self.browser, MAX_WAIT).until(EC.element_to_be_clickable(
            (By.XPATH, "//div[contains(@class, 'dx-popup-wrapper')]//div[@aria-label='save']"))).click()

    def open_sheet(self, path):

        #справочник листов
        sheet_select_id = "sheet_select_dropdown"
        sheet_select = self.wait_for_element_by_id(sheet_select_id)
        sheet_select.click()

        node_xpath = "//div[contains(@class, 'dx-treeview') and @layoutitemid='{}']//li[@aria-label='{}' ]/div[contains(@class,'dx-item')]".format(
            self.layout_item_id, path[0])
        self.wait_for_element_by_xpath(node_xpath)

        print("Справочник листов загрузился")


        sheet_name = path[-1]
        for node in path:
            if node!=sheet_name:
                self.open_sheet_list_node(node)


        sheet_xpath = "//div[contains(@class, 'dx-treeview') and @layoutitemid='{}']//li[@aria-label='{}' and @role='treeitem']/div[contains(@class,'dx-item')]".format(self.layout_item_id, sheet_name)

        sheet = self.browser.find_element_by_xpath(sheet_xpath)
        success = False
        while not success:
            try:
                ActionChains(self.browser).move_to_element(sheet).perform()
                success = True
            except:
                time.sleep(.1)
                ActionChains(self.browser).send_keys(Keys.ARROW_DOWN).perform()
        sheet.click()
        self.wait_for_loaded()

    def delete_all(self):
        max_count = 30
        count = 0
        while self.row_count()>0:
            count += 1
            if count > max_count:
                raise NameError("Слишком много попыток удаления (>{})".format(max_count))
            self.sheet_delete_first()
            self.wait_for_loaded()
            time.sleep(.2)
