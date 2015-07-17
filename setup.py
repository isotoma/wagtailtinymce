#!/usr/bin/env python

import codecs

try:
    from setuptools import setup, find_packages
except ImportError:
    from distutils.core import setup


def read(filename):
    try:
        return unicode(codecs.open(filename, encoding='utf-8').read())
    except NameError:
        return open(filename, 'r', encoding='utf-8').read()


install_requires = [
    'wagtail>=1.0b2',
    ]


setup(
    name='wagtailtinymce',
    version='4.2.1.0',
    description='A TinyMCE editor integration for Wagtail',
    author='Richard Mitchell',
    author_email='richard.mitchell@isotoma.com',
    url='https://github.com/isotoma/wagtailtinymce.git',
    packages=find_packages(),
    include_package_data=True,
    license='New BSD',
    long_description='\n\n'.join([read('README.rst'), read('CHANGELOG.rst'),
                                  read('LICENSE.rst')]),
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Framework :: Django',
        'Topic :: Internet :: WWW/HTTP :: Site Management',
    ],
    install_requires=install_requires,
    entry_points="""
    """,
    zip_safe=False,
)
